import express from 'express';
import morgan from 'morgan';
import router from './routes';

const PORT = process.env.PORT || 5003;

// This function will start our express app and inject database repositories. This will greately help for mocking our databases for tests
const startServer = () => {
  const app = express();

  // use express.json
  app.use(express.json());

  app.use(express.urlencoded({extended: false}));

  // INITIALISE MORGAN FOR REQUEST LOGS
  app.use(
    morgan('dev', {
      skip(req, res) {
        return req.path === '/api/v0/swarm/peers';
      },
    })
  );

  // INJECT REPOSITORIES
  // app.use(repositoriesInjector(database, services));

  // INTITIALISE RESPONSEHANDLER
  // app.use(responseHandler);

  // Define routes here
  app.use('/api/auth', router);

  const server = app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });

  return {app, server};
};

export default startServer;
