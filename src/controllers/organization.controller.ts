import { NextFunction, Request, Response } from 'express';
import { DonationsByMonth, Organization, TopDonators } from '@interfaces/organization.interface';
import { HttpException } from '@exceptions/HttpException';
import { app } from '@/server';
import { PreparedStatement, errors } from 'pg-promise';
import { logger } from '@/utils/logger';

class OrganizationService {
  // -- Create reusable Prepared Statements without values --

  // Organization info such as name, industry
  public orgInfoPS = new PreparedStatement({ name: 'org-info', text: 'SELECT * FROM organization WHERE id = $1' });

  // Donations across time (grouped by month)
  public donationByMonth = new PreparedStatement({
    name: 'donations-by-month',
    text: `
    SELECT
        DATE_TRUNC('month',date) AS month_start_date,
        SUM(amount)::float AS amount_donated
    FROM donation
    WHERE org_id = $1
    GROUP BY DATE_TRUNC('month',date)
    ORDER BY month_start_date;`,
  });

  // Top individual donators in an organization
  public topDonators = new PreparedStatement({
    name: 'top-donators',
    text: `
    SELECT
        contributor,
        SUM(amount)::float as total_amount
    FROM donation
    WHERE org_id = $1
    GROUP BY contributor
    ORDER BY SUM(amount) DESC
    LIMIT $2;`,
  });

  public async getOrgData(orgId: string): Promise<{ orgInfo: Organization; donationsByMonth: DonationsByMonth; topDonators: TopDonators }> {
    return app.db.task('get-org-data', async (t) => {
      // First check if org exists
      let orgInfo: Organization;
      try {
        orgInfo = await t.one(this.orgInfoPS, [orgId]);
      } catch (error) {
        if (error instanceof errors.QueryResultError && error.code === errors.queryResultErrorCode.noData) {
          throw new HttpException(404, 'Organization not found.');
        }
        throw error;
      }

      // Then, proceed with queries
      const donationsByMonth: DonationsByMonth = await t.many(this.donationByMonth, [orgId]);
      const topDonators: TopDonators = await t.many(this.topDonators, [orgId, 10]);
      logger.info(typeof topDonators[0].total_amount);

      return { orgInfo, donationsByMonth, topDonators };
    });
  }
}

class OrganizationController {
  public organizationService = new OrganizationService();

  public getOrganizationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = String(req.params.id);
      const orgData = await this.organizationService.getOrgData(orgId);

      res.status(200).json(orgData);
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationController;
