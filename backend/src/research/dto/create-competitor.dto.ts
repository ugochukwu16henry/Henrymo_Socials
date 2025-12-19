import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompetitorDto {
  @ApiProperty({ example: 'instagram', enum: ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'] })
  @IsString()
  @IsIn(['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'])
  platform: string;

  @ApiProperty({ example: '@competitor' })
  @IsString()
  handle: string;

  @ApiProperty({ example: 'competitor_user_id', required: false })
  @IsOptional()
  @IsString()
  platformUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  benchmarkMetrics?: any;
}

