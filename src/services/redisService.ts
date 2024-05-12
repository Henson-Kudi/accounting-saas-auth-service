import {redisClient} from '../configs/redis';
import IRedisService from '../types/services/redisService';

const redisService: IRedisService = {
  async getItem(filter) {
    const found = await redisClient.get(filter);

    return found;
  },

  async removeItem(key) {
    const deletedCount = await redisClient.del(key);
    return deletedCount;
  },

  setItem(key, value) {
    const created = redisClient.set(key, value);
    return created;
  },
};

export default redisService;
