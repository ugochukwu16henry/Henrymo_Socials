import { IsString, IsUUID, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTeamMemberDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'viewer', enum: ['admin', 'editor', 'viewer'], required: false })
  @IsOptional()
  @IsIn(['admin', 'editor', 'viewer'])
  role?: string;
}

