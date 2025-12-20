import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class AppService {
  private redisService: any;

  constructor(@Optional() @Inject('RedisService') redisService?: any) {
    // RedisService is injected if RedisModule is imported
    this.redisService = redisService;
  }

  async getHello(): Promise<{ message: string; timestamp: string; redis?: string }> {
    const health: { message: string; timestamp: string; redis?: string } = {
      message: 'HenryMo Socials API is running!',
      timestamp: new Date().toISOString(),
    };

    // Check Redis connection if available
    if (this.redisService) {
      try {
        const redisHealthy = await this.redisService.ping();
        health.redis = redisHealthy ? 'connected' : 'disconnected';
      } catch (error) {
        health.redis = 'error';
      }
    }

    return health;
  }
}

