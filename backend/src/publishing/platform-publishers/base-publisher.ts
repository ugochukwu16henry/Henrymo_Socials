import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  errorMessage?: string;
}

export abstract class BasePublisher {
  protected readonly logger: Logger;
  protected prisma: PrismaService;
  protected platformName: string;

  constructor(prisma: PrismaService, platformName: string) {
    this.prisma = prisma;
    this.platformName = platformName;
    this.logger = new Logger(`${platformName}Publisher`);
  }

  /**
   * Publish content to the platform
   * Must be implemented by each platform-specific publisher
   */
  abstract publish(
    accessToken: string,
    contentText: string,
    mediaUrls?: string[],
    options?: Record<string, any>,
  ): Promise<PublishResult>;

  /**
   * Update the post platform status in the database
   */
  protected async updatePostPlatformStatus(
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

  /**
   * Check if all platforms for a post are published
   */
  protected async checkAndUpdatePostStatus(postId: string): Promise<void> {
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
      // If any platform failed, mark post as failed
      await this.prisma.post.update({
        where: { id: postId },
        data: { status: 'failed' },
      });
    }
  }
}

