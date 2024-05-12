import IDataAccess, {IUsersDb, IUserTokensDb} from '../types/dataaccess';
import UsersDb from './users.db';
import UserTokensDb from './usertokens.db';

// GRANTS ALL REPOSITORIES ACCESS TO THE DATABASE. ALL MODEL FUNCTIONS COMBINED AND INJECTED INTO REPOSITORIES (BUSINESS LOGICS)

class DataAccess implements IDataAccess {
  UsersDb: IUsersDb = new UsersDb();
  UserTokensDB: IUserTokensDb = new UserTokensDb();
}

export default new DataAccess();
