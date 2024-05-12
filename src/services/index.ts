import IServices from '../types/services';
import AwsService from './aws';
import emailService from './email';
import jwtService from './jwtService';
import redisService from './redisService';

const services: IServices = {
  jwtService: jwtService,
  awsService: AwsService,
  emailService: emailService,
  redisService: redisService,
};

export default services;
