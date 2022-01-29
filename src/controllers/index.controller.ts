import { NextFunction, Request, Response } from 'express';
import { app } from '@/server';

class IndexController {
  public index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await app.db.any('SELECT * FROM recipient limit 1', [true]);
      res.status(200).json({ data: users, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
