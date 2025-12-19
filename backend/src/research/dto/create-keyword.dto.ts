import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeywordDto {
  @ApiProperty({ example: 'digital marketing' })
  @IsString()
  keyword: string;

  @ApiProperty({ example: 'instagram', required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  avgMonthlyVolume?: number;

  @ApiProperty({ example: 0.5, required: false })
  @IsOptional()
  @IsNumber()
  competitionScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  trendData?: any;
}

