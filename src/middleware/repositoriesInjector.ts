import {Request, Response, NextFunction} from 'express';
import RepositoryLocator from '../types/RepositoryLocator';
import IServices from '../types/services';

export default (
    repositories: RepositoryLocator,
    services: IServices
  ): ((req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.repositories = repositories;
    req.services = services;
    // console.log('Repository intjected');
    next();
  };
