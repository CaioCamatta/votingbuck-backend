import { Router } from 'express';
import OrganizationController from '@controllers/organization.controller';
import { Routes } from '@interfaces/routes.interface';

class OrganizationRoute implements Routes {
  public path = '/organizations';
  public router = Router();
  public orgController = new OrganizationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET data to populate an organization's dashboard.
    this.router.get(`${this.path}/list`, this.orgController.getOrganizationList);
    this.router.get(`${this.path}/:id(\\w+)`, this.orgController.getOrganizationData);
  }
}

export default OrganizationRoute;
