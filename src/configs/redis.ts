import * as redis from 'redis';
import environment from '../utils/environment';

export const redisClient: redis.RedisClientType = redis.createClient({
  url: environment.redis.url,
  socket: {
    reconnectStrategy: function (retries) {
      if (retries > 10) {
        console.log(
          'Too many attempts to reconnect. Redis connection was terminated'
        );
        throw new Error('Too many retries.');
      } else {
        return retries * 500; //the 500 means redis should delay for 500ms before retrying next reconnection
      }
    },
  },
});

redisClient.on('error', err => {
  throw err;
});

const connectRedis = async () => {
  const client = await redisClient.connect();
  console.log('Redis client connected successfully');
  return client;
};

export default connectRedis;
