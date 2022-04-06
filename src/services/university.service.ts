import {
  DonationsByMonth,
  DonationsByParty,
  University,
  TopRecipientsDollar,
  TopRecipientsDonation,
  IdeologyDistribution,
  TotalContributionsDollar,
  RegisteredVoters,
} from '@interfaces/university.interface';
import { HttpException } from '@exceptions/HttpException';
import { Prisma } from '@prisma/client';
import prismaClient from '@databases/postgresClient';

class UniversityService {
  public async getUniversityData(uniId: string, startDate: string, endDate: string): Promise<any> {
    // First check if uni exists (fetch uniinfo such as name, industry)
    const uniInfo: University = await prismaClient.organization.findUnique({
      where: {
        id: uniId,
      },
    });
    if (uniInfo === null || uniInfo.industry.toLowerCase() !== 'school') {
      throw new HttpException(404, 'University not found.');
    }

    // Setup date objects to be used for query (start/end date for the requested period)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Then, proceed with queries
    const [
      donationsByMonth,
      donationsByParty,
      topRecipientsDollar,
      topRecipientsDonation,
      ideologyDistribution,
      totalContributionsDollar,
      registeredVoters,
    ]: [
      DonationsByMonth,
      DonationsByParty,
      TopRecipientsDollar,
      TopRecipientsDonation,
      IdeologyDistribution,
      TotalContributionsDollar,
      RegisteredVoters,
    ] = [
      // Note: Prisma's groupBy function is broken.
      // Donations across time (grouped by month)
      await prismaClient.$queryRaw<DonationsByMonth>(
        Prisma.sql`
          SELECT
            DATE_TRUNC('month',date) AS month_start_date,
            SUM(amount)::float AS amount_donated
          FROM donation
          WHERE org_id = ${uniId}
          GROUP BY DATE_TRUNC('month',date)
          ORDER BY month_start_date;`,
      ),
      // DonationsByParty
      await prismaClient.$queryRaw<DonationsByParty>(Prisma.sql`
          SELECT
            party,
            SUM(amount)::float as total_amount
          FROM donation as d
          JOIN recipient as r
            ON d.rec_id = r.id
          WHERE org_id = ${uniId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
          GROUP BY party
          ORDER BY SUM(amount) DESC
          LIMIT 3;`),
      // Top recipients of dollars
      await prismaClient.$queryRaw<TopRecipientsDollar>(Prisma.sql`
      SELECT
        d.rec_id as id,
        SUM(d.amount) as amount_received,
        r.name as name,
        r.party as party
      FROM donation as d
      JOIN recipient as r 
        ON d.rec_id = r.id
      WHERE d.org_id = ${uniId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
      GROUP BY d.rec_id, r.name, r.party
      ORDER BY SUM(amount) DESC
      LIMIT 5;`),
      // Top recipients by number of donations
      await prismaClient.$queryRaw<TopRecipientsDonation>(Prisma.sql`
      SELECT
        d.rec_id as id,
        COUNT(d.amount) as donations_received,
        r.name as name,
        r.party as party
      FROM donation as d
      JOIN recipient as r 
        ON d.rec_id = r.id
      WHERE d.org_id = ${uniId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
      GROUP BY d.rec_id, r.name, r.party
      ORDER BY COUNT(amount) DESC
      LIMIT 5;`),
      // Ideology distribution for a company based on who they donate to
      await prismaClient.$queryRaw<IdeologyDistribution>(Prisma.sql`
      SELECT
        ideology,
        sum(d.amount) as dollars_donated
      FROM donation as d
      JOIN recipient as r 
        ON d.rec_id = r.id
      WHERE d.org_id = ${uniId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj} AND r.ideology IS NOT NULL
      GROUP BY ideology
      ORDER BY ideology ASC;`),
      // Total contributions by a university in dollars and Total contributions by an university by # of donations
      await prismaClient.$queryRaw<TotalContributionsDollar>(Prisma.sql`
      SELECT
        d.date as date,
        d.amount as dollars_donated
      FROM donation as d
      WHERE d.org_id = ${uniId}
      ORDER BY d.date ASC`),
      // Share of registered voters
      await prismaClient.$queryRaw<RegisteredVoters>(Prisma.sql`
      SELECT
        dem_count as democratic,
        rep_count as republican
      FROM registered_voters
      WHERE org_id = ${uniId} AND year = ${endDateObj.getFullYear()};`),
    ];

    return {
      uniInfo,
      donationsByMonth,
      donationsByParty,
      topRecipientsDollar,
      topRecipientsDonation,
      ideologyDistribution,
      totalContributionsDollar,
      registeredVoters,
    };
  }

  public async getUniversityList(states: string | undefined, sortField: string | undefined, order: string | undefined): Promise<any> {
    const stateCodetoName = {
      AL: 'Alabama',
      AK: 'Alaska',
      AZ: 'Arizona',
      AR: 'Arkansas',
      CA: 'California',
      CO: 'Colorado',
      CT: 'Connecticut',
      DE: 'Delaware',
      FL: 'Florida',
      GA: 'Georgia',
      HI: 'Hawaii',
      ID: 'Idaho',
      IL: 'Illinois',
      IN: 'Indiana',
      IA: 'Iowa',
      KS: 'Kansas',
      KY: 'Kentucky',
      LA: 'Louisiana',
      ME: 'Maine',
      MD: 'Maryland',
      MA: 'Massachusetts',
      MI: 'Michigan',
      MN: 'Minnesota',
      MS: 'Mississippi',
      MO: 'Missouri',
      MT: 'Montana',
      NE: 'Nebraska',
      NV: 'Nevada',
      NH: 'New Hampshire',
      NJ: 'New Jersey',
      NM: 'New Mexico',
      NY: 'New York',
      NC: 'North Carolina',
      ND: 'North Dakota',
      OH: 'Ohio',
      OK: 'Oklahoma',
      OR: 'Oregon',
      PA: 'Pennsylvania',
      RI: 'Rhode Island',
      SC: 'South Carolina',
      SD: 'South Dakota',
      TN: 'Tennessee',
      TX: 'Texas',
      UT: 'Utah',
      VT: 'Vermont',
      VA: 'Virginia',
      WA: 'Washington',
      WV: 'West Virginia',
      WI: 'Wisconsin',
      WY: 'Wyoming',
    };

    const numResults = 20; // Number of results for query to return

    // Form the query object
    const query: any = {
      where: {
        industry: 'School',
      },
      take: numResults,
      select: {
        id: true,
        name: true,
        location: true,
      },
    };

    // Add states to the query
    if (states) {
      const statesArr = states.split(',');
      if (!query.where.OR) {
        query.where.OR = [];
      }
      for (const state of statesArr) {
        query.where.OR.push({ location: { endsWith: stateCodetoName[state] } });
      }
    }

    // Add sorting to the query
    if (sortField) {
      if (!query.where.orderBy) {
        query.orderBy = [];
      }
      query.orderBy.push({ [sortField]: order === 'asc' ? 'asc' : 'desc' });
    }

    const universities: University[] = await prismaClient.organization.findMany(query);
    return { universities };
  }
}

export default UniversityService;
