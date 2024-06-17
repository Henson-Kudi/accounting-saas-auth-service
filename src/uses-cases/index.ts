import { IUsersDb } from '../types/dataaccess';
import RepositoryLocator, {IUsersRepository} from '../types/RepositoryLocator';
import UsersRepository from './usersRepo';
import IServices from '../types/services';

// ALL BUSINESS LOGICS COMBINED HERE AS ONE TO BE INJECTED INTO TO APP WHEN LOADING

export class Repository implements RepositoryLocator {
  constructor(
    private db: IUsersDb,
    private services: IServices
  ) {}

  usersRepository: IUsersRepository = new UsersRepository(
    this.db,
    this.services
  );
}

export default Repository;
