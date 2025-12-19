import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResearchService } from './research.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { CreateCompetitorDto } from './dto/create-competitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Research')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post('keywords')
  @ApiOperation({ summary: 'Add a keyword to track' })
  createKeyword(@Param('teamId') teamId: string, @Body() createKeywordDto: CreateKeywordDto) {
    return this.researchService.createKeyword(teamId, createKeywordDto);
  }

  @Get('keywords')
  @ApiOperation({ summary: 'Get all tracked keywords' })
  findAllKeywords(@Param('teamId') teamId: string) {
    return this.researchService.findAllKeywords(teamId);
  }

  @Post('competitors')
  @ApiOperation({ summary: 'Add a competitor to track' })
  createCompetitor(@Param('teamId') teamId: string, @Body() createCompetitorDto: CreateCompetitorDto) {
    return this.researchService.createCompetitor(teamId, createCompetitorDto);
  }

  @Get('competitors')
  @ApiOperation({ summary: 'Get all tracked competitors' })
  findAllCompetitors(@Param('teamId') teamId: string) {
    return this.researchService.findAllCompetitors(teamId);
  }
}

