import IServices from '../types/services';
import AwsService from './aws';
import emailService from './email';
import jwtService from './jwt';
import passwordService from './password';
import rabbitMq from './rabbitMq';
import redisService from './redis';

const services: IServices = {
  jwtService: jwtService,
  awsService: AwsService,
  emailService: emailService,
  redisService: redisService,
  rabbitMqService: rabbitMq,
  passwordService: passwordService,
};

export default services;
