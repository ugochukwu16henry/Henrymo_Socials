# Redis Module

Centralized Redis configuration and caching service for the application.

## Features

- **Redis Connection Management** - Singleton Redis client with retry logic
- **Caching Service** - High-level caching operations
- **Cache Decorators** - Easy-to-use decorators for method caching
- **Queue Support** - Used by BullMQ for job queues

## Usage

### Basic Caching

```typescript
import { RedisService } from './redis/redis.service';

@Injectable()
export class MyService {
  constructor(private redisService: RedisService) {}

  async getCachedData(key: string) {
    // Get from cache
    const cached = await this.redisService.get(key);
    if (cached) return cached;

    // Fetch from source
    const data = await this.fetchData();

    // Cache for 1 hour
    await this.redisService.set(key, data, 3600);
    return data;
  }
}
```

### Using Cache Decorator

```typescript
import { Cache, CacheInvalidate } from './redis/cache.decorator';
import { RedisService } from './redis/redis.service';

@Injectable()
export class UserService {
  constructor(private redisService: RedisService) {}

  @Cache({ ttl: 300, keyPrefix: 'user' })
  async getUser(id: string) {
    return this.userRepository.findOne(id);
  }

  @CacheInvalidate({ keyPattern: 'user:*' })
  async updateUser(id: string, data: UpdateUserDto) {
    return this.userRepository.update(id, data);
  }
}
```

### Redis Service Methods

- `get<T>(key: string): Promise<T | null>` - Get value
- `set(key: string, value: any, ttlSeconds?: number): Promise<boolean>` - Set value
- `delete(key: string): Promise<boolean>` - Delete key
- `deletePattern(pattern: string): Promise<number>` - Delete keys matching pattern
- `exists(key: string): Promise<boolean>` - Check if key exists
- `expire(key: string, seconds: number): Promise<boolean>` - Set expiration
- `ttl(key: string): Promise<number>` - Get time to live
- `increment(key: string, by?: number): Promise<number>` - Increment value
- `decrement(key: string, by?: number): Promise<number>` - Decrement value
- `ping(): Promise<boolean>` - Health check

## Configuration

### Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, only if Redis requires authentication
```

### Docker Compose

Redis is configured in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: henrymo_redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

## Use Cases

1. **API Response Caching** - Cache expensive database queries
2. **Session Storage** - Store user sessions
3. **Rate Limiting** - Track API rate limits
4. **Job Queues** - BullMQ uses Redis for job queues
5. **Real-time Data** - Cache frequently accessed data

## Connection Management

The Redis module automatically:
- Retries failed connections with exponential backoff
- Logs connection status
- Handles connection errors gracefully
- Closes connections on application shutdown

## Error Handling

All Redis operations catch and log errors, returning safe defaults:
- `get()` returns `null` on error
- `set()` returns `false` on error
- Methods fail gracefully without crashing the application

This ensures the application continues to work even if Redis is temporarily unavailable.

