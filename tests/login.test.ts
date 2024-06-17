import http from 'http'
import Express from 'express'
import supertest from 'supertest';
import { da, faker } from '@faker-js/faker';
import TestAgent from 'supertest/lib/agent';
import UsersDb from '../src/data-access/users.db';
import Repository from '../src/uses-cases';

import startServer from '../src';
import MockedDb from './__mocks__/db.mock';
import MockedServices from './__mocks__/services.mock';
import MockedRepos from './__mocks__/repos.mock'
import { emailService, jwtService, passwordService, rabbitMqService, redisService } from './__mocks__/services.mock'
import { BadRequestMessage, SuccessMessage } from '../src/utils/responseHandler/responseMessage';
import UserSchema from '../src/entities/schemas/User.schema';




let request: TestAgent | undefined;

const baseUrl = '/api/auth';

describe('Auth Service: Login', () => {
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

  it('Fails to login with incorrect password', async () => {
    const body = {
      email: faker.internet.email(),
      password: faker.internet.password()
    }

    const badRequest = new BadRequestMessage('Invalid credentials')

    const mockedLogin = jest.fn().mockRejectedValue(badRequest)

    repos.usersRepository.attemptLogin = mockedLogin

    const res = await request?.post(`${baseUrl}/login`).send(body)

    expect(res?.badRequest).toBeTruthy()
  })

  it('It Should login successfully', async () => {
    const body = {
      email: faker.internet.email(),
      password: faker.internet.password()
    }

    const user = new UserSchema({
      addresses: [],
      contacts: [],
      email: body.email,
      name: faker.person.fullName(),
      lastLoginAt: new Date(),
      passwordHash: ''
    })

    const mockedLogin = jest.fn().mockImplementation(() => ({
      refreshToken: 'string',
      accessToken: 'string',
      user
    }))

    repos.usersRepository.attemptLogin = mockedLogin

    const res = await request?.post(`${baseUrl}/login`).send(body)

    expect(res?.statusCode).toBe(201)

  })
})
