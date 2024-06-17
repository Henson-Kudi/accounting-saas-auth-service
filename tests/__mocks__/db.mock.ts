import UsersDb from '../../src/data-access/users.db';

jest.mock('../../src/data-access/users.db', )

const  MockedDb = UsersDb as jest.MockedClass<typeof UsersDb>

export default MockedDb
