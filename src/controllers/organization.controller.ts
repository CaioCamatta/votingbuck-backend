import OrganizationService from '@/services/organization.service';
import { NextFunction, Request, Response } from 'express';
import { start } from 'repl';
import { HttpException } from '@exceptions/HttpException';

class OrganizationController {
  public organizationService = new OrganizationService();

  public getOrganizationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.params.id;

      if (!req.query.start_date || !req.query.end_date) {
        throw new HttpException(400, 'Please pass start and end date parameters.');
      }

      const start_date = req.query.start_date.toString();
      const end_date = req.query.end_date.toString();
      const orgData = await this.organizationService.getOrganizationData(orgId, start_date, end_date);
      res.status(200).json(orgData);
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationController;
