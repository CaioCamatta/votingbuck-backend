import { DonationsByMonth, Organization, TopDonators } from '@interfaces/organization.interface';
import { HttpException } from '@exceptions/HttpException';
import { app } from '@/server';
import { Prisma } from '@prisma/client';

class OrganizationService {
  public async getOrgData(orgId: number): Promise<any> {
    // First check if org exists (fetch orginfo such as name, industry)
    const orgInfo: Organization = await app.db.organization.findUnique({
      where: {
        id: orgId,
      },
    });
    if (orgInfo === null) {
      throw new HttpException(404, 'Organization not found.');
    }

    // Then, proceed with queries
    const [donationsByMonth, topDonators]: [DonationsByMonth, TopDonators] = [
      // Donations across time (grouped by month)
      await app.db.$queryRaw<DonationsByMonth>(
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
      await app.db.$queryRaw<TopDonators>(Prisma.sql`
        SELECT
            contributor,
            SUM(amount)::float as total_amount
        FROM donation
        WHERE org_id = ${orgId}
        GROUP BY contributor
        ORDER BY SUM(amount) DESC
        LIMIT ${10};`),
    ];

    return { orgInfo, donationsByMonth, topDonators };
  }
}

export default OrganizationService;
