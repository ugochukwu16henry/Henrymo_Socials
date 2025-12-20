import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

export interface PublishPostJobData {
  postId: string;
  postPlatformId: string;
  socialAccountId: string;
  contentText: string;
  mediaUrls?: string[];
  platform: string;
}

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  constructor(
    @InjectQueue('publish-posts') private publishQueue: Queue,
    private prisma: PrismaService,
  ) {}

  /**
   * Schedule a post for publishing at the specified time
   */
  async schedulePost(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    if (!post.scheduledAt) {
      throw new Error(`Post ${postId} has no scheduledAt date`);
    }

    if (post.platforms.length === 0) {
      this.logger.warn(`Post ${postId} has no platforms to publish to`);
      return;
    }

    // Update post status to scheduled
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'scheduled' },
    });

    // Schedule jobs for each platform
    const jobs = await Promise.all(
      post.platforms.map(async (postPlatform) => {
        const jobData: PublishPostJobData = {
          postId: post.id,
          postPlatformId: postPlatform.id,
          socialAccountId: postPlatform.socialAccountId,
          contentText: post.contentText,
          mediaUrls: post.mediaUrls as string[] | undefined,
          platform: postPlatform.socialAccount.platform,
        };

        // Schedule job to run at scheduledAt time
        const job = await this.publishQueue.add(
          `publish-post-${postPlatform.id}`,
          jobData,
          {
            delay: new Date(post.scheduledAt).getTime() - Date.now(),
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000, // Start with 5 second delay
            },
            removeOnComplete: {
              age: 24 * 3600, // Keep completed jobs for 24 hours
              count: 1000, // Keep last 1000 completed jobs
            },
            removeOnFail: {
              age: 7 * 24 * 3600, // Keep failed jobs for 7 days
            },
          },
        );

        this.logger.log(
          `Scheduled post ${postId} for platform ${postPlatform.socialAccount.platform} at ${post.scheduledAt}`,
        );

        return job;
      }),
    );

    this.logger.log(`Scheduled ${jobs.length} publishing jobs for post ${postId}`);
  }

  /**
   * Cancel scheduled jobs for a post
   */
  async cancelScheduledPost(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        platforms: true,
      },
    });

    if (!post) {
      return;
    }

    // Cancel all jobs for this post
    const jobs = await this.publishQueue.getJobs(['delayed', 'waiting']);
    const postJobs = jobs.filter((job) => {
      const data = job.data as PublishPostJobData;
      return data.postId === postId;
    });

    await Promise.all(postJobs.map((job) => job.remove()));

    this.logger.log(`Cancelled ${postJobs.length} scheduled jobs for post ${postId}`);
  }

  /**
   * Publish a post immediately (not scheduled)
   */
  async publishNow(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    if (post.platforms.length === 0) {
      throw new Error(`Post ${postId} has no platforms to publish to`);
    }

    // Update post status
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'published', publishedAt: new Date() },
    });

    // Publish immediately (no delay)
    const jobs = await Promise.all(
      post.platforms.map(async (postPlatform) => {
        const jobData: PublishPostJobData = {
          postId: post.id,
          postPlatformId: postPlatform.id,
          socialAccountId: postPlatform.socialAccountId,
          contentText: post.contentText,
          mediaUrls: post.mediaUrls as string[] | undefined,
          platform: postPlatform.socialAccount.platform,
        };

        return this.publishQueue.add(`publish-post-${postPlatform.id}`, jobData, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        });
      }),
    );

    this.logger.log(`Queued ${jobs.length} immediate publishing jobs for post ${postId}`);
  }
}

