import * as amqp from 'amqplib';
import RabbitMQ from '../../configs/rabbitMq';
import IRabbitMQService, {
  ExchangeTypes,
} from '../../types/services/rabbitmq.service';
import RabbitMqQueues from '../../utils/constants/rabbitMqQueues.json';
// import calculateBackoffDelay from '../../utils/calculatebackoffDelay';

class RabbitMQService extends RabbitMQ implements IRabbitMQService {
  async publishMessage(
    config:
      | {
          exchange: string;
          exchangeType: ExchangeTypes;
          routeKey: string;
          task: Buffer;
          options?: {
            assert?: amqp.Options.AssertExchange;
            publish?: amqp.Options.Publish;
          };
        }
      | {
          queue: string;
          task: Buffer;
          options?: {
            assert?: amqp.Options.AssertQueue;
            publish?: amqp.Options.Publish;
          };
        }
  ): Promise<boolean> {
    let connection = await this?.getConnection();

    if (!connection) {
      connection = await this.connect();
    }

    const channel = await connection.createChannel();

    try {
      if ('exchange' in config) {
        await channel.assertExchange(config.exchange, config.exchangeType, {
          ...config?.options?.assert,
          durable: config.options?.assert?.durable ?? true,
        });

        const published = channel.publish(
          config.exchange,
          config.routeKey,
          config.task,
          {
            ...config?.options?.publish,
            persistent: config.options?.publish?.persistent ?? true,
          }
        );

        console.log(`message published to exchange: ${config?.exchange}`);
        return published;
      } else if ('queue' in config) {
        await channel.assertQueue(config.queue, {
          ...config?.options?.assert,
          durable: config?.options?.assert?.durable ?? true,
        });

        const published = channel.sendToQueue(config?.queue, config?.task, {
          ...config?.options?.publish,
          persistent: config?.options?.publish?.persistent ?? true,
        });

        console.log(`message published to queue: ${config?.queue}`);
        return published;
      } else {
        throw new Error('invalid params');
      }
    } catch (err) {
      console.log(err);
      return false;
    } finally {
      await channel.close();
    }
  }

  async registerConsumer(
    config: {
      exchange?: string;
      exchangeType?: ExchangeTypes;
      queueName?: string;
      routingKey?: string;
      options?: {
        assertExchange?: amqp.Options.AssertExchange;
        assertQueue?: amqp.Options.AssertQueue;
      };
    },
    msgConsumer: (
      msq: amqp.ConsumeMessage,
      attempts?: number
    ) => Promise<unknown>
  ): Promise<void> {
    let connection = await this.getConnection();

    if (!connection) {
      connection = await this.connect();
    }

    const channel = await connection.createChannel();

    if (config.exchange) {
      await channel.assertExchange(
        config?.exchange,
        config?.exchangeType ?? 'direct',
        {
          ...config?.options?.assertExchange,
          durable: config?.options?.assertExchange?.durable ?? true,
        }
      );
    }

    const queueParams: amqp.Options.AssertQueue = config?.queueName
      ? {
          ...config?.options?.assertQueue,
          durable: config?.options?.assertQueue?.durable ?? true,
        }
      : {
          ...config?.options?.assertQueue,
          exclusive: config?.options?.assertQueue?.exclusive ?? true,
        };

    const queue = await channel.assertQueue(
      config?.queueName ?? '',
      queueParams
    );

    // Only bind routing key if exchange is  passed as well since it is a required field
    if (config?.routingKey && config?.exchange) {
      await channel.bindQueue(
        config?.queueName ?? queue.queue,
        config?.exchange,
        config?.routingKey
      );
    }

    // process the message
    // We need to ensure that when consuming a message, if there is a replyTo Key, we need to reply to that queue with the processed data
    channel.consume(config?.queueName ?? queue.queue, async msg => {
      if (!msg) {
        return;
      }
      try {
        if (msg?.content) {
          const data = await msgConsumer(msg, 1);

          // We need to reply to the sender if they provide a reply url or queue.
          // We'll only reply to messages with a correlationId. Thus any request made without a correlationId but replyTo field, will not get any response
          if (msg.properties.replyTo && msg.properties.correlationId) {
            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(data)),
              {
                correlationId: msg.properties.correlationId,
              }
            );
          }

          channel.ack(msg);
        }
      } catch (err) {
        console.log(err);
        // SEND MESSAGE TO DEAD LETTER QUEUE SINCE IT CANNOT BE PROCESSED
        channel.sendToQueue(RabbitMqQueues.DEAD_LETTER.name, msg.content);

        channel.ack(msg!);
        // SEND MESSAGE TO SLACK TO VERIFY ERROR
      }
    });
  }
}

export default new RabbitMQService();

// const sampleConsumer = async (
//   msg: amqp.ConsumeMessage,
//   attempts = 1
// ): Promise<void> => {
//   const MAX_RETRIES_ATTEMPT = 2;

//   if (attempts > MAX_RETRIES_ATTEMPT) {
//     throw new Error('Attained max retries');
//   }

//   try {
//     if (msg?.content) {
//       const jsonData = JSON.parse(msg?.content?.toString());

//       console.log('Processing message');
//       // Continue normal msg processing
//       // return whatever objectLike structure you want
//     }
//   } catch (err) {
//     // retry logic
//     if (attempts < MAX_RETRIES_ATTEMPT) {
//       // calculate backoff delay
//       const delay = calculateBackoffDelay(attempts, 1000);
//       console.warn(
//         `Error processing message ${attempts}/${MAX_RETRIES_ATTEMPT} times`
//       );
//       console.warn(err);
//       // delay for <delay> secs before retry
//       await new Promise(resolve => setTimeout(resolve, delay));
//       // attempt retry
//       await sampleConsumer(msg, attempts + 1);
//     } else {
//       // Exceeded max retries, throw err
//       throw err;
//     }
//   }
// };
