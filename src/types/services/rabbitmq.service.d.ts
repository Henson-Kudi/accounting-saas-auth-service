import * as amqp from 'amqplib';

export type ExchangeTypes = 'direct' | 'fanout' | 'topic';

export default interface IRabbitMQService {
  closeConnection(): Promise<void>;
  publishMessage(
    config:
      | {
          exchange: string;
          exchangeType: ExchangeTypes;
          routeKey: string;
          task: Buffer;
          options?: {
            assert?: Options.AssertExchange;
            publish?: Options.Publish;
          };
        }
      | {
          queue: string;
          task: Buffer;
          options?: {
            assert?: Options.AssertQueue;
            publish?: Options.Publish;
          };
        }
  ): Promise<boolean>;
  registerConsumer(
    config: {
      exchange?: string;
      exchangeType?: ExchangeTypes;
      queueName?: string;
      routingKey?: string;
      options?: {
        assertExchange?: Options.AssertExchange;
        assertQueue?: Options.AssertQueue;
      };
    },
    msgConsumer: (msq: ConsumeMessage, attempts?: number) => Promise<unknown>
  );
  getConnection(): Promise<amqp.Connection | undefined>;
}
