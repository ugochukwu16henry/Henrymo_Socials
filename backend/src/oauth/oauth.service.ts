import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';

export interface OAuthState {
  userId: string;
  teamId: string;
  platform: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private socialAccountsService: SocialAccountsService,
  ) {}

  /**
   * Get OAuth authorization URL for Meta (Facebook/Instagram)
   */
  getMetaAuthUrl(userId: string, teamId: string, platform: 'facebook' | 'instagram'): string {
    const appId = this.configService.get<string>('META_APP_ID');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI') || 
      `${this.configService.get<string>('API_URL') || frontendUrl}/api/oauth/meta/callback`;

    if (!appId) {
      throw new BadRequestException('META_APP_ID is not configured');
    }

    // Encode state to pass userId, teamId, and platform
    const state = Buffer.from(
      JSON.stringify({ userId, teamId, platform }),
    ).toString('base64');

    // Scopes for Facebook/Instagram
    const scopes = platform === 'instagram' 
      ? 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement'
      : 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile';

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${encodeURIComponent(state)}` +
      `&response_type=code`;

    return authUrl;
  }

  /**
   * Handle Meta OAuth callback and exchange code for token
   */
  async handleMetaCallback(code: string, state: string) {
    try {
      // Decode state
      const stateData: OAuthState = JSON.parse(
        Buffer.from(decodeURIComponent(state), 'base64').toString(),
      );

      const appId = this.configService.get<string>('META_APP_ID');
      const appSecret = this.configService.get<string>('META_APP_SECRET');
      const redirectUri = this.configService.get<string>('META_REDIRECT_URI') || 
        `${this.configService.get<string>('FRONTEND_URL')}/oauth/callback/meta`;

      if (!appId || !appSecret) {
        throw new BadRequestException('Meta OAuth is not properly configured');
      }

      // Exchange code for access token
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const { access_token: shortLivedToken, expires_in } = tokenResponse.data;

      // Exchange short-lived token for long-lived token (60 days)
      const longLivedResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      });

      const { access_token: longLivedToken, expires_in: longLivedExpires } = longLivedResponse.data;

      // Get user/account information
      const userInfo = await this.getMetaUserInfo(longLivedToken, stateData.platform);

      // Calculate expiration date
      const expiresAt = longLivedExpires 
        ? new Date(Date.now() + longLivedExpires * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // Default to 60 days

      // Save or update social account
      const accountData = {
        platform: stateData.platform,
        platformUserId: userInfo.id,
        handle: userInfo.username || userInfo.name,
        accessToken: longLivedToken,
        refreshToken: null, // Meta doesn't use refresh tokens, but tokens can be extended
        expiresAt,
      };

      // Check if account already exists
      const existingAccount = await this.prisma.socialAccount.findFirst({
        where: {
          teamId: stateData.teamId,
          platform: stateData.platform,
          platformUserId: userInfo.id,
        },
      });

      if (existingAccount) {
        // Update existing account
        await this.prisma.socialAccount.update({
          where: { id: existingAccount.id },
          data: {
            accessToken: accountData.accessToken,
            expiresAt: accountData.expiresAt,
            handle: accountData.handle,
            isActive: true,
          },
        });
        return { success: true, accountId: existingAccount.id };
      } else {
        // Create new account
        const newAccount = await this.socialAccountsService.create(
          stateData.userId,
          stateData.teamId,
          accountData,
        );
        return { success: true, accountId: newAccount.id };
      }
    } catch (error: any) {
      this.logger.error(`Meta OAuth callback failed: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Failed to connect Meta account: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }

  /**
   * Get user/account information from Meta Graph API
   */
  private async getMetaUserInfo(accessToken: string, platform: string) {
    try {
      if (platform === 'instagram') {
        // For Instagram, first get pages the user manages
        const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
          params: {
            access_token: accessToken,
            fields: 'id,name,access_token,instagram_business_account',
          },
        });

        const pages = pagesResponse.data.data;
        if (!pages || pages.length === 0) {
          throw new BadRequestException('No Instagram Business accounts found');
        }

        // Get Instagram Business account
        const page = pages[0]; // Use first page, or allow user to select
        const igAccountId = page.instagram_business_account?.id;

        if (!igAccountId) {
          throw new BadRequestException('Instagram Business account not linked to Facebook Page');
        }

        const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${igAccountId}`, {
          params: {
            access_token: page.access_token,
            fields: 'id,username,account_type',
          },
        });

        return {
          id: igResponse.data.id,
          username: igResponse.data.username,
          name: igResponse.data.username,
        };
      } else {
        // For Facebook, get user info
        const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
          params: {
            access_token: accessToken,
            fields: 'id,name,email',
          },
        });

        return {
          id: userResponse.data.id,
          username: userResponse.data.name,
          name: userResponse.data.name,
        };
      }
    } catch (error: any) {
      this.logger.error(`Failed to get Meta user info: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get account information: ${error.message}`);
    }
  }

  /**
   * Refresh Meta access token (extend expiration)
   */
  async refreshMetaToken(socialAccountId: string) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account || account.platform !== 'facebook' && account.platform !== 'instagram') {
      throw new BadRequestException('Invalid account for Meta token refresh');
    }

    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');

    try {
      // Exchange current token for new long-lived token
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: account.accessToken,
        },
      });

      const { access_token: newToken, expires_in } = response.data;
      const expiresAt = expires_in 
        ? new Date(Date.now() + expires_in * 1000)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      await this.prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: {
          accessToken: newToken,
          expiresAt,
        },
      });

      return { success: true, expiresAt };
    } catch (error: any) {
      this.logger.error(`Failed to refresh Meta token: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to refresh token: ${error.message}`);
    }
  }
}

