import {
  DonationsByMonth,
  DonationsByParty,
  Organization,
  TopRecipientsDollar,
  TopRecipientsDonation,
  IdeologyDistribution,
  TotalContributionsDollar,
  RegisteredVoters,
} from '@interfaces/organization.interface';
import { HttpException } from '@exceptions/HttpException';
import { Prisma } from '@prisma/client';
import prismaClient from '@databases/postgresClient';

class OrganizationService {
  public async getOrganizationData(orgId: string, startDate: string, endDate: string): Promise<any> {
    // First check if org exists (fetch orginfo such as name, industry)
    const orgInfo: Organization = await prismaClient.organization.findUnique({
      where: {
        id: orgId,
      },
    });
    if (orgInfo === null || orgInfo.industry.toLowerCase() === 'school') {
      throw new HttpException(404, 'Organization not found.');
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
          WHERE org_id = ${orgId}
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
          WHERE org_id = ${orgId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
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
      WHERE d.org_id = ${orgId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
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
      WHERE d.org_id = ${orgId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj}
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
      WHERE d.org_id = ${orgId} AND d.date BETWEEN ${startDateObj} AND ${endDateObj} AND r.ideology IS NOT NULL
      GROUP BY ideology
      ORDER BY ideology ASC;`),
      // Total contributions by an organization in dollars and Total contributions by an organization by # of donations
      await prismaClient.$queryRaw<TotalContributionsDollar>(Prisma.sql`
      SELECT
        d.date as date,
        d.amount as dollars_donated
      FROM donation as d
      WHERE d.org_id = ${orgId}
      ORDER BY d.date ASC;`),
      // Share of registered voters
      await prismaClient.$queryRaw<RegisteredVoters>(Prisma.sql`
      SELECT
        dem_count as democratic,
        rep_count as republican
      FROM registered_voters
      WHERE org_id = ${orgId} AND year = ${endDateObj.getFullYear()};`),
    ];

    return {
      orgInfo,
      donationsByMonth,
      donationsByParty,
      topRecipientsDollar,
      topRecipientsDonation,
      ideologyDistribution,
      totalContributionsDollar,
      registeredVoters,
    };
  }

  public async getOrganizationList(industries?: string, sortField?: string, order?: string): Promise<any> {
    const numResults = 80; // Number of results for query to return

    // Form the query object
    const query: any = {
      where: {
        NOT: [
          {
            industry: 'School',
          },
        ],
      },
      take: numResults,
      select: {
        id: true,
        name: true,
        industry: true,
      },
    };

    // Add industries to the query
    if (industries) {
      query.where.OR = industries.split(',').map((industry) => {
        return { industry: industry };
      });
    }

    // Add sorting to the query
    if (sortField) {
      query.orderBy = [{ [sortField]: order === 'asc' ? 'asc' : 'desc' }];
    }

    const organizations: Organization[] = await prismaClient.organization.findMany(query);
    return { organizations };
  }
}

export default OrganizationService;
