import IRabbitMQService from '../../../types/services/rabbitmq.service';
import authenticateToken from './authenticateToken';
import RabbitMqQueues from '../../../utils/constants/rabbitMqQueues.json';

export default async function registerAllConsumers(rabbitMQ: IRabbitMQService) {
  // Authenticate request token
  await rabbitMQ.registerConsumer(
    {
      queueName: RabbitMqQueues.AUTH_QUEUES.authenticateJwt,
      options: {
        assertQueue: {
          durable: false,
        },
      },
    },
    authenticateToken
  );

  console.log('All queues registered');
}
