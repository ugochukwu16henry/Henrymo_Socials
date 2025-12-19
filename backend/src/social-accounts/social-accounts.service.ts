import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';

@Injectable()
export class SocialAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, teamId: string, createSocialAccountDto: CreateSocialAccountDto) {
    return this.prisma.socialAccount.create({
      data: {
        ...createSocialAccountDto,
        userId,
        teamId,
      },
    });
  }

  async findAll(teamId: string) {
    return this.prisma.socialAccount.findMany({
      where: { teamId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string, teamId: string) {
    return this.prisma.socialAccount.findFirst({
      where: { id, teamId },
    });
  }

  async remove(id: string, teamId: string) {
    return this.prisma.socialAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

