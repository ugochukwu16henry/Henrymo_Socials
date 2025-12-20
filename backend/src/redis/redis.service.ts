import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: RedisClient) {}

  /**
   * Get a value from Redis
   */
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error: any) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set a value in Redis
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error: any) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error: any) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const stream = this.redis.scanStream({
        match: pattern,
        count: 100,
      });

      let deletedCount = 0;
      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          const count = await this.redis.del(...keys);
          deletedCount += count;
        }
      });

      return new Promise((resolve) => {
        stream.on('end', () => resolve(deletedCount));
      });
    } catch (error: any) {
      this.logger.error(`Error deleting pattern ${pattern}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Error checking existence of key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds);
      return result === 1;
    } catch (error: any) {
      this.logger.error(`Error setting expiration for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error: any) {
      this.logger.error(`Error getting TTL for key ${key}: ${error.message}`);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, by);
    } catch (error: any) {
      this.logger.error(`Error incrementing key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, by: number = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, by);
    } catch (error: any) {
      this.logger.error(`Error decrementing key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the underlying Redis client (for advanced operations)
   */
  getClient(): RedisClient {
    return this.redis;
  }

  /**
   * Health check - ping Redis
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error: any) {
      this.logger.error(`Redis ping failed: ${error.message}`);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}

