import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, teamId: string, createPostDto: CreatePostDto) {
    const { platformIds, ...postData } = createPostDto;
    
    const post = await this.prisma.post.create({
      data: {
        ...postData,
        userId,
        teamId,
      },
    });

    // Create post-platform relationships if platformIds provided
    if (platformIds && platformIds.length > 0) {
      await Promise.all(
        platformIds.map((socialAccountId: string) =>
          this.prisma.postPlatform.create({
            data: {
              postId: post.id,
              socialAccountId,
              status: 'pending',
            },
          })
        )
      );
    }

    return this.findOne(post.id, teamId);
  }

  async findAll(teamId: string) {
    return this.prisma.post.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, teamId: string) {
    return this.prisma.post.findFirst({
      where: { id, teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
    });
  }

  async update(id: string, teamId: string, updatePostDto: UpdatePostDto) {
    return this.prisma.post.updateMany({
      where: { id, teamId },
      data: updatePostDto,
    });
  }

  async remove(id: string, teamId: string) {
    return this.prisma.post.deleteMany({
      where: { id, teamId },
    });
  }
}

