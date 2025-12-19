import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { CreateCompetitorDto } from './dto/create-competitor.dto';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  // Keywords
  async createKeyword(teamId: string, createKeywordDto: CreateKeywordDto) {
    return this.prisma.keyword.create({
      data: {
        ...createKeywordDto,
        teamId,
      },
    });
  }

  async findAllKeywords(teamId: string) {
    return this.prisma.keyword.findMany({
      where: { teamId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Competitors
  async createCompetitor(teamId: string, createCompetitorDto: CreateCompetitorDto) {
    return this.prisma.competitorAccount.create({
      data: {
        ...createCompetitorDto,
        teamId,
      },
    });
  }

  async findAllCompetitors(teamId: string) {
    return this.prisma.competitorAccount.findMany({
      where: { teamId, isActive: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

