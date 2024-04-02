import startServer from './src';

const startApp = async () => {
  try {
    // Connect to database
    // Connect redis and rabbitMQ (if needed)
    // Connect other services
    const server = startServer();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startApp();
