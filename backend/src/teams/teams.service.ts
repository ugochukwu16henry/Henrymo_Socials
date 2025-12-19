import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        ownerId: userId,
        planTier: createTeamDto.planTier || 'free',
        members: {
          create: {
            userId,
            role: 'admin',
          },
        },
      },
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
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.team.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
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
            socialAccounts: true,
            posts: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
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
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check if user has access
    const hasAccess =
      team.ownerId === userId ||
      team.members.some((member) => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this team');
    }

    return team;
  }

  async update(id: string, userId: string, updateTeamDto: UpdateTeamDto) {
    const team = await this.findOne(id, userId);

    // Only owner can update
    if (team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can update team settings');
    }

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
    });
  }

  async addMember(teamId: string, userId: string, addMemberDto: AddTeamMemberDto) {
    const team = await this.findOne(teamId, userId);

    // Check if user is admin or owner
    const member = team.members.find((m) => m.userId === userId);
    const isAdmin = team.ownerId === userId || member?.role === 'admin';

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can add members');
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId: addMemberDto.userId,
        role: addMemberDto.role || 'viewer',
      },
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

  async removeMember(teamId: string, memberId: string, userId: string) {
    const team = await this.findOne(teamId, userId);

    // Check if user is admin or owner
    const member = team.members.find((m) => m.userId === userId);
    const isAdmin = team.ownerId === userId || member?.role === 'admin';

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can remove members');
    }

    return this.prisma.teamMember.delete({
      where: { id: memberId },
    });
  }

  async remove(id: string, userId: string) {
    const team = await this.findOne(id, userId);

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Only team owner can delete team');
    }

    return this.prisma.team.delete({
      where: { id },
    });
  }
}

