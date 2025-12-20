import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PublishingService } from './publishing.service';
import { PublishingProcessor } from './publishing.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlatformFactory } from './platform-publishers/platform-factory';

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
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

