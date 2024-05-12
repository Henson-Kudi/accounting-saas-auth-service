export default interface IRedisService {
  getItem(filter: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<string | null>;
  removeItem(key: string): Promise<number>;
}
