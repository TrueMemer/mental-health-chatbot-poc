import { CacheAdapter } from '#/interfaces/cache-adapter';
import Redis, { RedisOptions } from 'ioredis';

export class RedisCache implements CacheAdapter {
  private client: Redis;

  constructor(options: RedisOptions) {
    this.client = new Redis(options);
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (data === null) return null;
    try {
      return JSON.parse(data) as T;
    } catch (err) {
      console.error(`Error parsing JSON from Redis for key "${key}":`, err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, data, 'EX', ttl);
    } else {
      await this.client.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
