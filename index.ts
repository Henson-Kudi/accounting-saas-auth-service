import 'dotenv/config';
import startServer from './src';
import connectRedis from './src/configs/redis';
import generateKeyPair from './src/utils/generateKeyPair';
import jwtService from './src/services/jwtService';
import environment from './src/utils/environment';
import UserSchema from './src/entities/schemas/User.schema';
import {v4 as uuid} from 'uuid';
import {randomBytes} from 'crypto';

const startApp = async () => {
  try {
    // Connect to database
    // Connect redis and rabbitMQ (if needed)
    await connectRedis();

    // Connect other services
    const server = startServer();
  } catch (error) {
    console.error(error);
    throw new Error('Startup error');
  }
};

startApp();
