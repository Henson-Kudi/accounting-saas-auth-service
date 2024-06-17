import Repository from "../../src/uses-cases";

jest.mock('../../src/uses-cases', () => {
  // Use a manual mock implementation
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      // Mock the usersRepository property and its methods
      return {
        usersRepository: {
          attemptLogin: jest.fn(),
          registerUser: jest.fn(),
          verifyOtpCode: jest.fn(),
          refreshToken: jest.fn(),
          findUserById: jest.fn(),
          findUserByIdAndUpdate: jest.fn(),
          createToken: jest.fn(),
        },
      };
    }),
  };
})


const MockedRepos = Repository as jest.MockedClass<typeof Repository>

export default MockedRepos
