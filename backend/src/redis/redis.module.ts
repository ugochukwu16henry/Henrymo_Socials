import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis as RedisClient } from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redis = new RedisClient({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis connection error:', err);
        });

        return redis;
      },
      inject: [ConfigService],
    },
    RedisService,
    {
      provide: 'RedisService',
      useExisting: RedisService,
    },
  ],
  exports: ['REDIS_CLIENT', RedisService, 'RedisService'],
})
export class RedisModule {}

