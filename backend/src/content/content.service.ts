import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, teamId: string, createPostDto: CreatePostDto) {
    const { platformIds, mediaUrls, scheduledAt, status, contentText } = createPostDto;
    
    const post = await this.prisma.post.create({
      data: {
        contentText,
        mediaUrls: mediaUrls ? mediaUrls : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: status || 'draft',
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
    const { mediaUrls, scheduledAt, ...rest } = updatePostDto;
    const updateData: any = { ...rest };
    
    if (mediaUrls !== undefined) {
      updateData.mediaUrls = mediaUrls;
    }
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }
    
    const updated = await this.prisma.post.updateMany({
      where: { id, teamId },
      data: updateData,
    });
    
    if (updated.count === 0) {
      return null;
    }
    
    return this.findOne(id, teamId);
  }

  async remove(id: string, teamId: string) {
    return this.prisma.post.deleteMany({
      where: { id, teamId },
    });
  }
}

