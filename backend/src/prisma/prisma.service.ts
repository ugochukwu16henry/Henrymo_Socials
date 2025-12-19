import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connectionRetries = 0;
  private readonly maxRetries = 5;

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to database');
        this.connectionRetries = 0;
        return;
      } catch (error: any) {
        this.connectionRetries++;
        this.logger.warn(
          `Database connection attempt ${this.connectionRetries}/${this.maxRetries} failed: ${error.message}`,
        );
        
        if (i < this.maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        } else {
          this.logger.error('Failed to connect to database after all retries', error);
          // Still don't throw - let app start but log the error
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

