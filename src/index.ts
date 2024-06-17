import 'dotenv/config'
import express from 'express';
import morgan from 'morgan';
import router from './routes';
import repositoriesInjector from './middleware/repositoriesInjector';
import environment from './utils/environment';
import RepositoryLocator from './types/RepositoryLocator';
import IServices from './types/services';

const PORT = environment.server.port;

// This function will start our express app and inject database repositories. This will greately help for mocking our databases for tests
const startServer = (repositories: RepositoryLocator, services:IServices) => {
  const app = express();

  // use express.json
  app.use(express.json());

  app.use(express.urlencoded({ extended: false }));

  // INITIALISE MORGAN FOR REQUEST LOGS
  app.use(
    morgan('dev', {
      skip(req) {
        return req.path === '/api/v0/swarm/peers';
      },
    })
  );

  // INJECT REPOSITORIES AND SERVICES
  app.use(repositoriesInjector(repositories, services));

  // INTITIALISE RESPONSEHANDLER
  // app.use(responseHandler);

  // Define routes here
  app.use('/api/auth', router);

  const server = app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });

  return { app, server };
};

export default startServer;
