import RecipientService from '@/services/recipient.service';
import { NextFunction, Request, Response } from 'express';

class RecipientController {
  public recipientService = new RecipientService();

  public getRecipientData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recId = parseInt(req.params.id);
      const recData = await this.recipientService.getRecipientData(recId);

      res.status(200).json(recData);
    } catch (error) {
      next(error);
    }
  };
}

export default RecipientController;
