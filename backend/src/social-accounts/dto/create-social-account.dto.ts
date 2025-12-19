import { IsString, IsIn, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSocialAccountDto {
  @ApiProperty({ example: 'instagram', enum: ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'] })
  @IsString()
  @IsIn(['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'])
  platform: string;

  @ApiProperty({ example: 'user123' })
  @IsString()
  platformUserId: string;

  @ApiProperty({ example: '@username' })
  @IsString()
  handle: string;

  @ApiProperty({ example: 'access_token_here' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'refresh_token_here', required: false })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

