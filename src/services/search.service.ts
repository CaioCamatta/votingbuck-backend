import redisClient from '@databases/redisClient';
import { SearchResult } from '@interfaces/search.interface';
import prismaClient from '@databases/postgresClient';
import { logger } from '@/utils/logger';

// For each category of entity, return this number of results
export const RESULTS_PER_CATEGORY = 5;

class SearchService {
  public async search(query: string, type: 'politician' | 'corporate' | 'university'): Promise<any> {
    // Query with Levenshtein distance of one OR as prefix
    // If the query is empty, just return top results of each category
    const redisQuery =
      (query
        ? `(${query
            .split(' ')
            .map((term) => `%${term}%|`)
            .join('')}${query}*)`
        : '') + `@category:{${type}}`;

    const results: SearchResult = (await redisClient.ft.search(process.env.REDIS_INDEX_NAME, redisQuery, {
      SCORER: 'DOCSCORE',
      LIMIT: { from: 0, size: RESULTS_PER_CATEGORY },
    })) as SearchResult;

    return results;
  }

  /**
   * Populate Redis with data if it is empty.
   *
   * This should run only once every time Redis is flushed or initialized.
   * For example, if new data is available in the main Postgres DB, we would
   * want to flush Redis so the data is updated.
   *
   * There is lots of room for improvement in terms of populating Redis.
   */
  public populateRedisSearch = async (): Promise<void> => {
    try {
      // Try to get index info (fails if index doesn't exist existent)
      const ftInfo = await redisClient.ft.info(process.env.REDIS_INDEX_NAME);

      // If index exists but isn't empty, exit
      if (ftInfo.numDocs != '0') {
        return;
      }
    } catch (error) {
      // If index doesn't exist or is empty, we populate it
      logger.info(error);
    }

    // Get necessary data
    const corporates = await prismaClient.organization.findMany({
      where: {
        NOT: {
          industry: 'School',
        },
      },
      select: {
        name: true,
        id: true,
        corp_revolvers: true,
      },
    });
    const universities = await prismaClient.organization.findMany({
      where: {
        industry: 'School',
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

    // Calculate averages for each score criteria so we can calculate individual scores
    // relative to the average (see README for more info)
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
      const score = this._score(-parseInt(uni.uni_rank as any), avgUniRanking as any);
      await redisClient
        .multi()
        .hSet(`entity:uni:${uni.id}`, 'name', uni.name)
        .hSet(`entity:uni:${uni.id}`, 'category', 'university')
        .hSet(`entity:uni:${uni.id}`, 'id', uni.id)
        .hSet(`entity:uni:${uni.id}`, 'score', score)
        .exec();
    });
    politicians.forEach(async (pol) => {
      const score = this._score(parseInt(pol.wealth as any), avgPoliticianWealth as any);
      await redisClient
        .multi()
        .hSet(`entity:pol:${pol.id}`, 'name', pol.name)
        .hSet(`entity:pol:${pol.id}`, 'category', 'politician')
        .hSet(`entity:pol:${pol.id}`, 'id', pol.id)
        .hSet(`entity:pol:${pol.id}`, 'score', score)
        .exec();
    });
    corporates.forEach(async (cor) => {
      const score = this._score(parseInt(cor.corp_revolvers as any), avgCorpRevolvers as any);
      await redisClient
        .multi()
        .hSet(`entity:cor:${cor.id}`, 'name', cor.name)
        .hSet(`entity:cor:${cor.id}`, 'category', 'corporate')
        .hSet(`entity:cor:${cor.id}`, 'id', cor.id)
        .hSet(`entity:cor:${cor.id}`, 'score', score)
        .exec();
    });
    logger.info(`Populated Redis with ${universities.length} universities, ${corporates.length} corporates, and ${politicians.length} politicians.`);
  };

  /**
   * Map a positive number into the range [0, 1) using a sigmoid-like function.
   * This is necessary because scores in Redis must be in the [0,1] range
   */
  private _score = (x: number, avg: number) => {
    return 1 - 1 / (1 + x / avg);
  };
}

export default SearchService;
