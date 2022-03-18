import OrganizationService from '@/services/organization.service';
import { NextFunction, Request, Response } from 'express';
const url = require('url');

class OrganizationController {
  public organizationService = new OrganizationService();

  public getOrganizationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.params.id;
      const queryObject = url.parse(req.url, true).query;
      const orgData = await this.organizationService.getOrganizationData(orgId, queryObject.start_date, queryObject.end_date);

      res.status(200).json(orgData);
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationController;
