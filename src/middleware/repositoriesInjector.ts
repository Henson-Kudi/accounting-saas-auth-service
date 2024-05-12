import {Request, Response, NextFunction} from 'express';
import repositories from '../uses-cases';
import services from '../services';

export default function repositoriesInjector(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.repositories = repositories;
  req.services = services;
  console.log('Repository intjected');
  next();
}
