import { IsString, IsOptional, IsArray, IsDateString, IsIn, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Check out our latest product launch! 🚀' })
  @IsString()
  contentText: string;

  @ApiProperty({ example: ['https://example.com/image.jpg'], required: false })
  @IsOptional()
  @IsArray()
  mediaUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ example: 'draft', enum: ['draft', 'scheduled', 'published'], required: false })
  @IsOptional()
  @IsIn(['draft', 'scheduled', 'published'])
  status?: string;

  @ApiProperty({ example: ['social-account-id-1', 'social-account-id-2'], required: false })
  @IsOptional()
  @IsArray()
  platformIds?: string[];
}

