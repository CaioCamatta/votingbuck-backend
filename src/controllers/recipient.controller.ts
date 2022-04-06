import RecipientService from '@/services/recipient.service';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

class RecipientController {
  public recipientService = new RecipientService();

  public getRecipientData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recId = req.params.id;

      if (!req.query.start_date || !req.query.end_date) {
        throw new HttpException(400, 'Please pass start and end date parameters.');
      }

      const startDate = req.query.start_date.toString();
      const endDate = req.query.end_date.toString();
      const recData = await this.recipientService.getRecipientData(recId, startDate, endDate);
      res.status(200).json(recData);
    } catch (error) {
      next(error);
    }
  };

  public getRecipientList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Unpack the query parameters
      const states: string | undefined = req.query.states?.toString();
      const sortField: string | undefined = req.query.sortField?.toString();
      const order: string | undefined = req.query.order?.toString();

      const orgList = await this.recipientService.getRecipientList(states, sortField, order);
      res.status(200).json(orgList);
    } catch (error) {
      next(error);
    }
  };
}

export default RecipientController;
