import OrganizationService from '@/services/organization.service';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

class OrganizationController {
  public organizationService = new OrganizationService();

  public getOrganizationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.params.id;

      if (!req.query.start_date || !req.query.end_date) {
        throw new HttpException(400, 'Please pass start and end date parameters.');
      }

      const startDate = req.query.start_date.toString();
      const endDate = req.query.end_date.toString();
      const orgData = await this.organizationService.getOrganizationData(orgId, startDate, endDate);
      res.status(200).json(orgData);
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationController;
