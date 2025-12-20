import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, SocialAccountsModule, PrismaModule],
  controllers: [OAuthController],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}

