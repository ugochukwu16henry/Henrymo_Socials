import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalTeams,
      totalPosts,
      totalSocialAccounts,
      recentUsers,
      recentTeams,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.team.count(),
      this.prisma.post.count(),
      this.prisma.socialAccount.count(),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          emailVerified: true,
          isAdmin: true,
        },
      }),
      this.prisma.team.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              posts: true,
              socialAccounts: true,
            },
          },
        },
      }),
    ]);

    // Get users by registration date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersLast30Days = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      stats: {
        totalUsers,
        totalTeams,
        totalPosts,
        totalSocialAccounts,
        usersLast30Days,
      },
      recentUsers,
      recentTeams,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedTeams: true,
            teamMemberships: true,
            socialAccounts: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllTeams() {
    return this.prisma.team.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            socialAccounts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedTeams: {
          include: {
            _count: {
              select: {
                members: true,
                posts: true,
                socialAccounts: true,
              },
            },
          },
        },
        teamMemberships: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        socialAccounts: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        posts: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            ownedTeams: true,
            teamMemberships: true,
            socialAccounts: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserRole(userId: string, isAdmin: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });
  }
}

