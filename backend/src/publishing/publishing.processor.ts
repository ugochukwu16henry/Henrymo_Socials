import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformFactory } from './platform-publishers/platform-factory';
import { PublishPostJobData } from './publishing.service';

@Processor('publish-posts')
export class PublishingProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishingProcessor.name);

  constructor(
    private prisma: PrismaService,
    private platformFactory: PlatformFactory,
  ) {
    super();
  }

  async process(job: Job<PublishPostJobData>): Promise<void> {
    const { postId, postPlatformId, socialAccountId, contentText, mediaUrls, platform } = job.data;

    this.logger.log(
      `Processing publish job for post ${postId} on platform ${platform} (job ${job.id})`,
    );

    try {
      // Get social account with access token
      const socialAccount = await this.prisma.socialAccount.findUnique({
        where: { id: socialAccountId },
      });

      if (!socialAccount) {
        throw new Error(`Social account ${socialAccountId} not found`);
      }

      if (!socialAccount.isActive) {
        throw new Error(`Social account ${socialAccountId} is not active`);
      }

      if (!socialAccount.accessToken) {
        throw new Error(`Social account ${socialAccountId} has no access token`);
      }

      // Get the appropriate publisher for the platform
      const publisher = this.platformFactory.getPublisher(platform);

      // Publish to the platform
      const result = await publisher.publish(
        socialAccount.accessToken,
        contentText,
        mediaUrls,
      );

      // Update post platform status
      await this.updatePostPlatformStatus(
        postPlatformId,
        result.success,
        result.platformPostId,
        result.errorMessage,
      );

      // Check if all platforms are published and update post status
      await this.checkAndUpdatePostStatus(postId);

      if (result.success) {
        this.logger.log(
          `Successfully published post ${postId} to ${platform} (platform post ID: ${result.platformPostId})`,
        );
      } else {
        this.logger.error(
          `Failed to publish post ${postId} to ${platform}: ${result.errorMessage}`,
        );
        throw new Error(result.errorMessage || 'Unknown publishing error');
      }
    } catch (error: any) {
      this.logger.error(
        `Error processing publish job for post ${postId} on platform ${platform}: ${error.message}`,
        error.stack,
      );

      // Update post platform status to failed
      await this.prisma.postPlatform.update({
        where: { id: postPlatformId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      // Re-throw to mark job as failed
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
  }

  private async updatePostPlatformStatus(
    postPlatformId: string,
    success: boolean,
    platformPostId?: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.postPlatform.update({
      where: { id: postPlatformId },
      data: {
        status: success ? 'published' : 'failed',
        platformPostId: success ? platformPostId : undefined,
        errorMessage: success ? undefined : errorMessage,
        publishedAt: success ? new Date() : undefined,
      },
    });
  }

  private async checkAndUpdatePostStatus(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        platforms: true,
      },
    });

    if (!post) {
      return;
    }

    const allPublished = post.platforms.every((pp) => pp.status === 'published');
    const anyFailed = post.platforms.some((pp) => pp.status === 'failed');

    if (allPublished) {
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: post.publishedAt || new Date(),
        },
      });
    } else if (anyFailed && post.status === 'scheduled') {
      await this.prisma.post.update({
        where: { id: postId },
        data: { status: 'failed' },
      });
    }
  }
}

