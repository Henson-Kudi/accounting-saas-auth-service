import AWSService from './AWSService';
import EmailService from './emailService';
import JWTService from './JWTService';
import IPasswordService from './password.service';
import IRabbitMQService from './rabbitmq.service';
import IRedisService from './redisService';

export default interface IServices {
  awsService: AWSService;
  jwtService: JWTService;
  emailService: EmailService;
  redisService: IRedisService;
  rabbitMqService: IRabbitMQService;
  passwordService: IPasswordService;
}
