import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BasePublisher } from './base-publisher';
import { InstagramPublisher } from './instagram.publisher';
import { FacebookPublisher } from './facebook.publisher';
import { TwitterPublisher } from './twitter.publisher';
import { LinkedInPublisher } from './linkedin.publisher';
import { TikTokPublisher } from './tiktok.publisher';
import { YoutubePublisher } from './youtube.publisher';

@Injectable()
export class PlatformFactory {
  private publishers: Map<string, BasePublisher>;

  constructor(private prisma: PrismaService) {
    this.publishers = new Map();
    this.initializePublishers();
  }

  private initializePublishers(): void {
    // Initialize platform-specific publishers
    // Note: These are instantiated directly, not through DI
    // They will receive PrismaService in their constructors
    this.publishers.set('instagram', new InstagramPublisher(this.prisma));
    this.publishers.set('facebook', new FacebookPublisher(this.prisma));
    this.publishers.set('twitter', new TwitterPublisher(this.prisma));
    this.publishers.set('linkedin', new LinkedInPublisher(this.prisma));
    this.publishers.set('tiktok', new TikTokPublisher(this.prisma));
    this.publishers.set('youtube', new YoutubePublisher(this.prisma));
  }

  getPublisher(platform: string): BasePublisher {
    const publisher = this.publishers.get(platform.toLowerCase());
    if (!publisher) {
      throw new Error(`No publisher found for platform: ${platform}`);
    }
    return publisher;
  }
}

