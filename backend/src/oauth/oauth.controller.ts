import { Controller, Get, Query, Param, UseGuards, Request, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { OAuthService } from './oauth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oAuthService: OAuthService) {}

  @Get('meta/:platform/authorize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Meta OAuth authorization URL' })
  @ApiQuery({ name: 'teamId', required: true, description: 'Team ID' })
  authorizeMeta(
    @Request() req,
    @Param('platform') platform: 'facebook' | 'instagram',
    @Query('teamId') teamId: string,
  ) {
    if (platform !== 'facebook' && platform !== 'instagram') {
      throw new BadRequestException('Platform must be "facebook" or "instagram"');
    }

    const authUrl = this.oAuthService.getMetaAuthUrl(req.user.id, teamId, platform);
    return { authUrl };
  }

  @Get('meta/callback')
  @ApiOperation({ summary: 'Handle Meta OAuth callback' })
  @ApiQuery({ name: 'code', required: true, description: 'Authorization code from Meta' })
  @ApiQuery({ name: 'state', required: true, description: 'State parameter' })
  async handleMetaCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.oAuthService.handleMetaCallback(code, state);
      
      // Redirect to frontend success page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/oauth/callback/meta?success=true&accountId=${result.accountId}`;
      
      res.redirect(redirectUrl);
    } catch (error: any) {
      // Redirect to frontend error page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/oauth/callback/meta?error=${encodeURIComponent(error.message)}`;
      res.redirect(redirectUrl);
    }
  }

  @Get('meta/refresh/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Meta access token' })
  async refreshMetaToken(@Param('accountId') accountId: string) {
    return this.oAuthService.refreshMetaToken(accountId);
  }
}

