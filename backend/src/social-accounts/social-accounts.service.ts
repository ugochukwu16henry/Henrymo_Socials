import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialAccountDto } from './dto/create-social-account.dto';

@Injectable()
export class SocialAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, teamId: string, createSocialAccountDto: CreateSocialAccountDto) {
    // Check if account already exists
    const existing = await this.prisma.socialAccount.findFirst({
      where: {
        teamId,
        platform: createSocialAccountDto.platform,
        platformUserId: createSocialAccountDto.platformUserId,
      },
    });

    if (existing) {
      // Update existing account
      return this.prisma.socialAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: createSocialAccountDto.accessToken,
          refreshToken: createSocialAccountDto.refreshToken,
          expiresAt: createSocialAccountDto.expiresAt ? new Date(createSocialAccountDto.expiresAt) : null,
          handle: createSocialAccountDto.handle,
          isActive: true,
        },
      });
    }

    // Create new account
    return this.prisma.socialAccount.create({
      data: {
        ...createSocialAccountDto,
        expiresAt: createSocialAccountDto.expiresAt ? new Date(createSocialAccountDto.expiresAt) : null,
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

