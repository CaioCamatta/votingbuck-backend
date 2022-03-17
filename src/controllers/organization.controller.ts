import OrganizationService from '@/services/organization.service';
import { NextFunction, Request, Response } from 'express';

class OrganizationController {
  public organizationService = new OrganizationService();

  public getOrganizationData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.params.id;
      const orgData = await this.organizationService.getOrganizationData(orgId);

      res.status(200).json(orgData);
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationController;
