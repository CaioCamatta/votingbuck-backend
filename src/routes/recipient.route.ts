import { Router } from 'express';
import RecipientController from '@controllers/recipient.controller';
import { Routes } from '@interfaces/routes.interface';

class RecipientRoute implements Routes {
  public path = '/recipients';
  public router = Router();
  public recController = new RecipientController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET data to populate a recipient's dashboard.
    this.router.get(`${this.path}/:id(\\w+)`, this.recController.getRecipientData);
  }
}

export default RecipientRoute;
