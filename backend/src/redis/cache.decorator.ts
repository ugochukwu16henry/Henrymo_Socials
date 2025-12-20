import { Injectable, Inject, ExecutionContext } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Cache decorator options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string; // Prefix for cache key
  keyGenerator?: (args: any[]) => string; // Custom key generator
}

/**
 * Cache decorator - caches method results in Redis
 * 
 * @example
 * @Cache({ ttl: 300, keyPrefix: 'user' })
 * async getUser(id: string) {
 *   return this.userRepository.findOne(id);
 * }
 */
export function Cache(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const { ttl = 3600, keyPrefix = '', keyGenerator } = options;

    descriptor.value = async function (...args: any[]) {
      // Get RedisService from the instance (injected via constructor)
      const redisService = this.redisService as RedisService | undefined;

      if (!redisService) {
        // If RedisService is not available, just execute the method
        return method.apply(this, args);
      }

      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(args)
        : `${keyPrefix || target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await redisService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      
      // Cache the result
      if (result !== null && result !== undefined) {
        await redisService.set(cacheKey, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator - clears cache when method is called
 * 
 * @example
 * @CacheInvalidate({ keyPrefix: 'user', keyPattern: 'user:*' })
 * async updateUser(id: string, data: UpdateUserDto) {
 *   return this.userRepository.update(id, data);
 * }
 */
export function CacheInvalidate(options: { keyPrefix?: string; keyPattern?: string } = {}) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const { keyPrefix = '', keyPattern } = options;

    descriptor.value = async function (...args: any[]) {
      const redisService = this.redisService as RedisService | undefined;

      // Execute the method first
      const result = await method.apply(this, args);

      // Invalidate cache
      if (redisService) {
        const pattern = keyPattern || `${keyPrefix || target.constructor.name}:*`;
        await redisService.deletePattern(pattern);
      }

      return result;
    };

    return descriptor;
  };
}

