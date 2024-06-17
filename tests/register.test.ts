import http from 'http'
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import TestAgent from 'supertest/lib/agent';
import UsersDb from '../src/data-access/users.db';

import startServer from '../src';
import MockedDb from './__mocks__/db.mock';
import MockedServices from './__mocks__/services.mock';
import MockedRepos from './__mocks__/repos.mock'
import { emailService, jwtService, passwordService, rabbitMqService, redisService } from './__mocks__/services.mock'

import Repository from '../src/uses-cases';
import UserSchema from '../src/entities/schemas/User.schema';
import UserTokensSchema from '../src/entities/schemas/UserTokens.schema';

let request: TestAgent | undefined;

const baseUrl = '/api/auth';

describe('Auth App: User Registration', () => {
  let Server: http.Server;
  let db: jest.Mocked<UsersDb>
  let repos: jest.Mocked<Repository>


  beforeAll(() => {

    db = new MockedDb() as jest.Mocked<UsersDb>

    repos = new MockedRepos(db, MockedServices) as jest.Mocked<Repository>


    const { app, server } = startServer(repos, MockedServices)

    request = supertest(app);

    Server = server

  });

  afterAll(async () => {
    // Server.close(done);
    await new Promise<void>((resolve) => {
      Server?.close(() => {
        resolve();
      });
    });
  });

  // We want to clear all mocks  before each test block
  beforeEach(() => {
    MockedDb.mockClear()

    MockedRepos.mockClear()

    emailService.sendMail.mockClear()
    emailService.verifyEmail.mockClear()
    jwtService.decodeToken.mockClear()
    jwtService.generateJWtToken.mockClear()
    jwtService.verifyToken.mockClear()
    passwordService.encrypt.mockClear()
    passwordService.verify.mockClear()
    rabbitMqService.closeConnection.mockClear()
    rabbitMqService.getConnection.mockClear()
    rabbitMqService.publishMessage.mockClear()
    rabbitMqService.registerConsumer.mockClear()
    redisService.getItem.mockClear()
    redisService.removeItem.mockClear()
    redisService.setItem.mockClear()
  })

  it('Should Fail With Validation Error', async () => {
    try {
      const res = await request?.post(baseUrl).send({});
      expect(res?.statusCode).toEqual(422);
    } catch (err) {
      console.log(err);
    }
  });

  it('Should successfully create a user', async () => {
    try {
      const password = '1234@AbcdThe23Boss'

      const data = {
        name: faker.person.fullName().replace(/[^\w\s]/g, ''),
        email: faker.internet.email().toLowerCase(),
        addresses: [
          {
            type: 'Home',
            line1: faker.location.streetAddress(),
          },
        ],

        contacts: [
          {
            type: 'Main',
            phone: '+971588629213',
          },
        ],
        password: password,
        repeatPassword: password,
      };

      const ressolvedValue = new UserSchema({
        addresses: data.addresses as unknown as any[],
        contacts: [
          {
            phone: data.contacts[0].phone,
            type: data.contacts[0].type as unknown as any
          }
        ],
        email: data.email,
        lastLoginAt: new Date(),
        name: data.name,
        passwordHash: data.password,
      })

      db.createUsers.mockResolvedValue(ressolvedValue);

      const res = await request?.post(baseUrl).send(data);

      expect(res?.body?.statusCode).toBe(202);
      expect(res?.body?.data?.name).toBe(ressolvedValue.name)
      expect(res?.body?.data?.id).toBe(ressolvedValue.id)
      expect(db.createUsers).toHaveBeenCalled()
      expect(res?.body?.data?.id).toBeDefined();
    } catch (err) {
      console.log(err);
    }
  });

  it('Should fail with validation error of passwords missmatch', async () => {
    try {
      const data = {
        name: faker.person.fullName().replace(/[^\w\s]/g, ''),
        email: faker.internet.email().toLowerCase(),
        addresses: [
          {
            type: 'Home',
            line1: faker.location.streetAddress(),
          },
        ],

        contacts: [
          {
            type: 'Main',
            phone: '+971588629213',
          },
        ],
        password: faker.internet.password({
          length: 8,
        }),
        repeatPassword: faker.internet.password({
          length: 8,
        }),
      };

      const res = await request?.post(baseUrl).send(data);

      expect(res?.body?.statusCode).toBe(422);
    } catch (err) {
      console.log(err);
    }
  });

  it('Should fail with validation error if Main Contact Detail is not provided', async () => {
    try {
      const password = faker.internet.password({
        length: 8,
      })

      const data = {
        name: faker.person.fullName().replace(/[^\w\s]/g, ''),
        email: faker.internet.email().toLowerCase(),
        addresses: [
          {
            type: 'Home',
            line1: faker.location.streetAddress(),
          },
        ],

        contacts: [
          {
            type: 'Home',
            phone: '+971588629213',
          },
        ],
        password: password,
        repeatPassword: password
      };

      const res = await request?.post(baseUrl).send(data);

      expect(res?.body?.statusCode).toBe(422);
    } catch (err) {
      console.log(err);
    }
  });

  it('Should register user, send email and publish message to rabbitMq channel', async () => {
    try {
      const password = 'myFakePassword@1223';

      const data = {
        name: faker.person.fullName().replace(/[^\w\s]/g, ''),
        email: faker.internet.email().toLowerCase(),
        addresses: [
          {
            type: 'Home',
            line1: faker.location.streetAddress(),
          },
        ],

        contacts: [
          {
            type: 'Main',
            phone: '+971588629213',
          },
        ],
        password: password,
        repeatPassword: password,
      };

      const res = await request?.post(baseUrl).send(data);

      expect(res?.body?.statusCode).toBe(202);
      expect(res?.body?.data?.id).toBeDefined();
    } catch (err) {

    }
  })

  it('Should verify otp successfully', async () => {

    const data = {
      email: faker.internet.email().toLowerCase(),
      otpCode: '123456'
    };

    const ressolvedPerson = new UserSchema({
      addresses: [],
      contacts: [

      ],
      email: data.email,
      lastLoginAt: new Date(),
      name: faker.person.fullName(),
      passwordHash: '',
    })

    const newToken = new UserTokensSchema({
      expireAt: new Date(),
      token: 'some token',
      type: 'OTP',
      userId: ressolvedPerson._id,
    })

    db.findUserByEmail.mockResolvedValue(ressolvedPerson)
    db.findUserById.mockResolvedValue(ressolvedPerson)
    db.findToken.mockResolvedValue(newToken)
    db.deleteTokens.mockResolvedValue(true)
    jwtService.generateJWtToken.mockImplementation(() => 'jwt string')
    db.createToken.mockResolvedValue(newToken)
    db.findUserByIdAndUpdate.mockResolvedValue(ressolvedPerson)

    repos.usersRepository.verifyOtpCode = jest.fn().mockResolvedValue({ accessToken: 'accessToken', refreshToken: 'refreshToken', user: ressolvedPerson })

    const res = await request?.post(`${baseUrl}/verify-otp`).send(data);

    expect(res?.statusCode).toBe(201)

  })
});
