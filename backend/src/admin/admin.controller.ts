import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiForbiddenResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get all teams' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  getAllTeams() {
    return this.adminService.getAllTeams();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user admin role' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  updateUserRole(
    @Param('id') id: string,
    @Body() body: { isAdmin: boolean },
  ) {
    return this.adminService.updateUserRole(id, body.isAdmin);
  }
}

