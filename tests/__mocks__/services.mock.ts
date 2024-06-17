import path from 'path';
import IServices from '../../src/types/services';
import AWSService from '../../src/types/services/AWSService';
import JWTService from '../../src/types/services/JWTService';
import EmailService from '../../src/types/services/emailService';
import IPasswordService from '../../src/types/services/password.service';
import IRabbitMQService from '../../src/types/services/rabbitmq.service';
import IRedisService from '../../src/types/services/redisService';

export const redisService: jest.Mocked<IRedisService> = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn()
}
export const rabbitMqService: jest.Mocked<IRabbitMQService> = {
  closeConnection: jest.fn(),
  getConnection: jest.fn(),
  publishMessage: jest.fn(),
  registerConsumer: jest.fn()
}

export const passwordService: jest.Mocked<IPasswordService> = {
  encrypt: jest.fn(),
  verify: jest.fn()
}

export const emailService: jest.Mocked<EmailService> = {
  sendMail: jest.fn(),
  verifyEmail: jest.fn()
}
export const jwtService: jest.Mocked<JWTService> = {
  decodeToken: jest.fn(),
  generateJWtToken: jest.fn(),
  verifyToken: jest.fn()
}

export const awsService: jest.Mocked<AWSService> = {
  secretsManager: {
    createSecret: jest.fn(),
    getSecretValue: jest.fn(),
  },
}

const MockedServices: jest.Mocked<IServices> = {
  awsService,
  emailService,
  jwtService,
  passwordService,
  rabbitMqService,
  redisService
}

export default MockedServices

