import UniversityService from '@/services/university.service';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';

class UniversityController {
  public universityService = new UniversityService();

  public getUniversityData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const uniId = req.params.id;

      if (!req.query.start_date || !req.query.end_date) {
        throw new HttpException(400, 'Please pass start and end date parameters.');
      }

      const startDate = req.query.start_date.toString();
      const endDate = req.query.end_date.toString();
      const uniData = await this.universityService.getUniversityData(uniId, startDate, endDate);
      res.status(200).json(uniData);
    } catch (error) {
      next(error);
    }
  };
}

export default UniversityController;
