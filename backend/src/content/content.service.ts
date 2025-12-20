import { Injectable, Optional, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private publishingService: any;

  constructor(
    private prisma: PrismaService,
    @Optional() @Inject('PUBLISHING_SERVICE') publishingService?: any,
  ) {
    this.publishingService = publishingService;
  }

  async create(userId: string, teamId: string, createPostDto: CreatePostDto) {
    const { platformIds, mediaUrls, scheduledAt, status, contentText } = createPostDto;
    
    const post = await this.prisma.post.create({
      data: {
        contentText,
        mediaUrls: mediaUrls ? mediaUrls : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? (status || 'scheduled') : (status || 'draft'),
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

    const createdPost = await this.findOne(post.id, teamId);

    // If post is scheduled, add it to the publishing queue
    if (createdPost?.scheduledAt && createdPost.status === 'scheduled' && this.publishingService) {
      try {
        await this.publishingService.schedulePost(post.id);
        this.logger.log(`Scheduled post ${post.id} for publishing`);
      } catch (error: any) {
        // Log error but don't fail the post creation
        this.logger.error(`Failed to schedule post ${post.id}: ${error.message}`);
      }
    }

    return createdPost;
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
    
    // Get the existing post to check if scheduledAt changed
    const existingPost = await this.prisma.post.findFirst({
      where: { id, teamId },
    });

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

    const updatedPost = await this.findOne(id, teamId);

    // If scheduledAt changed and post is now scheduled, update the queue
    if (this.publishingService && updatedPost) {
      if (scheduledAt !== undefined && updatedPost.scheduledAt) {
        // Cancel old jobs and reschedule
        try {
          await this.publishingService.cancelScheduledPost(id);
          await this.publishingService.schedulePost(id);
          this.logger.log(`Rescheduled post ${id} for publishing`);
        } catch (error: any) {
          this.logger.error(`Failed to reschedule post ${id}: ${error.message}`);
        }
      } else if (existingPost?.scheduledAt && !updatedPost.scheduledAt) {
        // If scheduledAt was removed, cancel scheduled jobs
        try {
          await this.publishingService.cancelScheduledPost(id);
          this.logger.log(`Cancelled scheduled jobs for post ${id}`);
        } catch (error: any) {
          this.logger.error(`Failed to cancel scheduled post ${id}: ${error.message}`);
        }
      }
    }
    
    return updatedPost;
  }

  async remove(id: string, teamId: string) {
    return this.prisma.post.deleteMany({
      where: { id, teamId },
    });
  }
}

