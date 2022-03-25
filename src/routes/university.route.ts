import { Router } from 'express';
import UniversityController from '@controllers/university.controller';
import { Routes } from '@interfaces/routes.interface';

class UniversityRoute implements Routes {
  public path = '/universities';
  public router = Router();
  public uniController = new UniversityController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET data to populate a university's dashboard.
    this.router.get(`${this.path}/:id(\\w+)`, this.uniController.getUniversityData);
  }
}

export default UniversityRoute;
