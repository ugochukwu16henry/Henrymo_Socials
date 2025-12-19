import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialAccountsService } from './social-accounts.service';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Social Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/social-accounts')
export class SocialAccountsController {
  constructor(private readonly socialAccountsService: SocialAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Connect a social media account' })
  create(@Request() req, @Param('teamId') teamId: string, @Body() createSocialAccountDto: CreateSocialAccountDto) {
    return this.socialAccountsService.create(req.user.id, teamId, createSocialAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all social accounts for a team' })
  findAll(@Param('teamId') teamId: string) {
    return this.socialAccountsService.findAll(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get social account by ID' })
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.socialAccountsService.findOne(id, teamId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect social account' })
  remove(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.socialAccountsService.remove(id, teamId);
  }
}

