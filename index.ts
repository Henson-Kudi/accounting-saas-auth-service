import 'dotenv/config';
import startServer from './src';
import connectRedis from './src/configs/redis';
import rabbitMq from './src/services/rabbitMq';
import registerAllConsumers from './src/services/rabbitMq/consumers';
import Repositories from './src/uses-cases/index';
import services from './src/services';
import UsersDb from './src/data-access/users.db';

const startApp = async () => {
  try {
    // Connect to database
    // Connect redis and rabbitMQ (if needed)
    await connectRedis();
    await rabbitMq.connect();

    // Register RabbitMq consumers
    registerAllConsumers(rabbitMq);

    // Connect other services
    startServer(new Repositories(new UsersDb(), services), services);
  } catch (error) {
    console.error(error);
    throw new Error('Startup error');
  }
};

startApp();
