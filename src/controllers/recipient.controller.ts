import RecipientService from '@/services/recipient.service';
import { NextFunction, Request, Response } from 'express';

class RecipientController {
  public recipientService = new RecipientService();

  public getRecipientData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = parseInt(req.params.id);
      const orgData = await this.recipientService.getOrgData(orgId);

      res.status(200).json(orgData);
    } catch (error) {
      next(error);
    }
  };
}

export default RecipientController;
