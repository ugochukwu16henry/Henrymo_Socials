import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(socialAccountId: string, startDate: Date, endDate: Date) {
    return this.prisma.metricsDaily.findMany({
      where: {
        socialAccountId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getAggregatedMetrics(socialAccountId: string, startDate: Date, endDate: Date) {
    const metrics = await this.getMetrics(socialAccountId, startDate, endDate);

    return {
      totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
      totalReach: metrics.reduce((sum, m) => sum + m.reach, 0),
      totalLikes: metrics.reduce((sum, m) => sum + m.likes, 0),
      totalComments: metrics.reduce((sum, m) => sum + m.comments, 0),
      totalShares: metrics.reduce((sum, m) => sum + m.shares, 0),
      totalProfileVisits: metrics.reduce((sum, m) => sum + m.profileVisits, 0),
      netFollowersGained: metrics.reduce((sum, m) => sum + m.followsGained - m.followsLost, 0),
      engagementRate: this.calculateEngagementRate(metrics),
      dailyBreakdown: metrics,
    };
  }

  private calculateEngagementRate(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const totalEngagement = metrics.reduce((sum, m) => sum + m.likes + m.comments + m.shares, 0);
    const totalReach = metrics.reduce((sum, m) => sum + m.reach, 0);
    return totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
  }

  async updateDailyMetrics(socialAccountId: string, date: Date, metrics: any) {
    return this.prisma.metricsDaily.upsert({
      where: {
        socialAccountId_date: {
          socialAccountId,
          date,
        },
      },
      update: metrics,
      create: {
        socialAccountId,
        date,
        ...metrics,
      },
    });
  }
}

