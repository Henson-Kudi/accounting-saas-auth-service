import IDataAccess from '../types/dataaccess';
import RepositoryLocator, {IUsersRepository} from '../types/RepositoryLocator';
import UsersRepository from './usersRepo';
import dataAccess from '../data-access';
import IServices from '../types/services';
import services from '../services';

// ALL BUSINESS LOGICS COMBINED HERE AS ONE TO BE INJECTED INTO TO APP WHEN LOADING

class Repository implements RepositoryLocator {
  constructor(
    private db: IDataAccess,
    private services: IServices
  ) {}

  usersRepository: IUsersRepository = new UsersRepository(
    this.db.UsersDb,
    this.services
  );
}

export default new Repository(dataAccess, services);
