import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'My Marketing Team' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'free', enum: ['free', 'pro', 'agency'], required: false })
  @IsOptional()
  @IsIn(['free', 'pro', 'agency'])
  planTier?: string;
}

