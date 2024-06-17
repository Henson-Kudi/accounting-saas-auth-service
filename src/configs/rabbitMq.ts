import * as amqp from 'amqplib';
import environment from '../utils/environment';

class RabbitMQ {
  private connection?: amqp.Connection;

  async connect(): Promise<amqp.Connection> {
    if (this.connection) {
      return this.connection;
    }

    if (!environment.rabbitMq.connectionUrl) {
      throw new Error('Invalid connection url');
    }

    this.connection = await amqp.connect(environment.rabbitMq.connectionUrl);

    console.log('RabbitMQ Connected successfully');

    return this.connection;
  }

  async getConnection(): Promise<amqp.Connection | undefined> {
    return this.connection;
  }

  async closeConnection(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.close();
      }
    } catch (err) {
      console.log('Failed to close rabbitMq connection');
      console.log(err);
    } finally {
      this.connection = undefined;
    }
  }
}

export default RabbitMQ;
