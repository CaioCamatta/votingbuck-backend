import { DonationsByMonth, DonationsByParty, Organization, TopDonators, TopRecipients } from '@interfaces/organization.interface';
import { HttpException } from '@exceptions/HttpException';
import { Prisma } from '@prisma/client';
import prismaClient from '@databases/client';

class OrganizationService {
  public async getOrganizationData(orgId: number, startDate: string, endDate: string): Promise<any> {
    // First check if org exists (fetch orginfo such as name, industry)
    const orgInfo: Organization = await prismaClient.organization.findUnique({
      where: {
        id: orgId,
      },
    });
    if (orgInfo === null) {
      throw new HttpException(404, 'Organization not found.');
    }

    // Setup date objects to be used for query (start/end date for the requested period)
    const start_date = new Date(startDate);
    const end_date = new Date(endDate);

    // Then, proceed with queries
    const [donationsByMonth, topDonators, donationsByParty, topRecipients]: [DonationsByMonth, TopDonators, DonationsByParty, TopRecipientsDollar] = [
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
      // Top individual donators in an organization
      await prismaClient.$queryRaw<TopDonators>(Prisma.sql`
        SELECT
          contributor,
          SUM(amount)::float as total_amount
        FROM donation
        WHERE org_id = ${orgId}
        GROUP BY contributor
        ORDER BY SUM(amount) DESC
        LIMIT ${10};`),
      // DonationsByParty
      await prismaClient.$queryRaw<DonationsByParty>(Prisma.sql`
          SELECT
            party,
            SUM(amount)::float as total_amount
          FROM donation as d
          JOIN recipient as r
            ON d.rec_id = r.id
          WHERE org_id = ${orgId}
          GROUP BY party
          ORDER BY SUM(amount) DESC;`),
      // TopRecipients
      //Aggregate all donations from specific organization to specified recipient and return top 5 recipients along with extra data from recipients table
      await prismaClient.$queryRaw<TopRecipientsDollar>(Prisma.sql`
      SELECT
        d.rec_id as id,
        SUM(d.amount) as amount_received,
        r.name as name,
        r.party as party
      FROM donation as d
      JOIN recipient as r 
        ON d.rec_id = r.id
      WHERE d.org_id = ${orgId} AND d.date BETWEEN ${start_date} AND ${end_date}
      GROUP BY d.rec_id, r.name, r.party
      ORDER BY SUM(amount) DESC
      LIMIT 5;`),
    ];

    return { orgInfo, donationsByMonth, topDonators, donationsByParty, topRecipients };
  }
}

export default OrganizationService;
