import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { hash } from 'bcrypt';
import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';

class UserService {
  public users = userModel;

  public async findAllUser(): Promise<User[]> {
    const users: User[] = this.users;
    return users;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = this.users.find((user) => user.id === userId);
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = this.users.find((user) => user.email === userData.email);
    if (findUser) throw new HttpException(409, `Your email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = { id: this.users.length + 1, ...userData, password: hashedPassword };
    this.users = [...this.users, createUserData];

    return createUserData;
  }

  public async updateUser(userId: number, userData: CreateUserDto): Promise<User[]> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = this.users.find((user) => user.id === userId);
    if (!findUser) throw new HttpException(409, "You're not user");

    const hashedPassword = await hash(userData.password, 10);
    const updateUserData: User[] = this.users.map((user: User) => {
      if (user.id === findUser.id) user = { id: userId, ...userData, password: hashedPassword };
      return user;
    });

    return updateUserData;
  }

  public async deleteUser(userId: number): Promise<User[]> {
    const findUser: User = this.users.find((user) => user.id === userId);
    if (!findUser) throw new HttpException(409, "You're not user");

    const deleteUserData: User[] = this.users.filter((user) => user.id !== findUser.id);
    return deleteUserData;
  }
}

class UsersController {
  public userService = new UserService();

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const userData: CreateUserDto = req.body;
      const updateUserData: User[] = await this.userService.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData: User[] = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
