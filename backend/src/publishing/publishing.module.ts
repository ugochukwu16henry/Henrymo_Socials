import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PublishingService } from './publishing.service';
import { PublishingProcessor } from './publishing.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PlatformFactory } from './platform-publishers/platform-factory';

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: 'publish-posts',
    }),
  ],
  providers: [
    PublishingService,
    PublishingProcessor,
    PlatformFactory,
    {
      provide: 'PUBLISHING_SERVICE',
      useExisting: PublishingService,
    },
  ],
  exports: [PublishingService, 'PUBLISHING_SERVICE'],
})
export class PublishingModule {}

