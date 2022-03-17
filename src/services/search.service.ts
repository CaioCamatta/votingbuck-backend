import redisClient from '@databases/redisClient';
import { SearchResult } from '@interfaces/search.interface';
import prismaClient from '@databases/postgresClient';
import { logger } from '@/utils/logger';

class SearchService {
  public async search(query: string, type: 'politician' | 'corporate' | 'university'): Promise<any> {
    // Query with Levenshtein distance of two OR as prefix
    const redisQuery =
      (query
        ? `(${query
            .split(' ')
            .map((term) => `%${term}%|`)
            .join('')}${query}*)`
        : '') + `@category:{${type}}`;

    const results: SearchResult = (await redisClient.ft.search(process.env.REDIS_INDEX_NAME, redisQuery, {
      SCORER: 'DOCSCORE',
      LIMIT: { from: 0, size: 2 },
    })) as SearchResult;

    return results;
  }

  public populateRedisSearch = async (): Promise<void> => {
    try {
      // Try to get index info (fails if not existent)
      const ftInfo = await redisClient.ft.info(process.env.REDIS_INDEX_NAME);

      // If index exists but isn't empty, exit
      if (ftInfo.numDocs != '3') {
        return;
      }
    } catch (error) {
      // If index doesn't exist, populate it
    }

    const corporates = await prismaClient.organization.findMany({
      where: {
        industry: 'corp',
      },
      select: {
        name: true,
        id: true,
        corp_revolvers: true,
      },
    });
    const universities = await prismaClient.organization.findMany({
      where: {
        industry: 'school',
      },
      select: {
        name: true,
        id: true,
        uni_rank: true,
      },
    });
    const politicians = await prismaClient.recipient.findMany({
      select: {
        name: true,
        id: true,
        wealth: true,
      },
    });

    if (corporates === null || universities === null || politicians === null) {
      logger.error('Data not found when populating RedisSearch');
      return;
    }

    // Calculate averages for each score criteria so we can calculate individual scores (see readme)
    const avgUniRanking = (
      await prismaClient.organization.aggregate({
        where: {
          industry: 'school',
        },
        _avg: {
          uni_rank: true,
        },
      })
    )._avg.uni_rank;
    const avgPoliticianWealth = (
      await prismaClient.recipient.aggregate({
        _avg: {
          wealth: true,
        },
      })
    )._avg.wealth;
    const avgCorpRevolvers = (
      await prismaClient.organization.aggregate({
        where: {
          industry: 'corp',
        },
        _avg: {
          corp_revolvers: true,
        },
      })
    )._avg.corp_revolvers;

    // Add everything to Redis
    universities.forEach(async (uni) => {
      const score = 1 - (1 / (1 + parseInt(uni.uni_rank as any) / (avgUniRanking as any))) * 0.9;
      await redisClient
        .multi()
        .hSet(`entity:uni:${uni.id}`, 'name', uni.name)
        .hSet(`entity:uni:${uni.id}`, 'category', 'university')
        .hSet(`entity:uni:${uni.id}`, 'id', uni.id)
        .hSet(`entity:uni:${uni.id}`, 'score', score)
        .exec();
    });
    politicians.forEach(async (pol) => {
      const score = 1 - (1 / (1 + parseInt(pol.wealth as any) / (avgPoliticianWealth as any))) * 0.9;
      await redisClient
        .multi()
        .hSet(`entity:pol:${pol.id}`, 'name', pol.name)
        .hSet(`entity:pol:${pol.id}`, 'category', 'politician')
        .hSet(`entity:pol:${pol.id}`, 'id', pol.id)
        .hSet(`entity:pol:${pol.id}`, 'score', score)
        .exec();
    });
    corporates.forEach(async (cor) => {
      const score = 1 - (1 / (1 + parseInt(cor.corp_revolvers as any) / (avgCorpRevolvers as any))) * 0.9;
      await redisClient
        .multi()
        .hSet(`entity:cor:${cor.id}`, 'name', cor.name)
        .hSet(`entity:cor:${cor.id}`, 'category', 'corporate')
        .hSet(`entity:cor:${cor.id}`, 'id', cor.id)
        .hSet(`entity:cor:${cor.id}`, 'score', score)
        .exec();
    });
    logger.info('Populated Redis.');
  };
}

export default SearchService;
