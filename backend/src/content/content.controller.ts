import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/posts')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Request() req, @Param('teamId') teamId: string, @Body() createPostDto: CreatePostDto) {
    return this.contentService.create(req.user.id, teamId, createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts for a team' })
  findAll(@Param('teamId') teamId: string) {
    return this.contentService.findAll(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.contentService.findOne(id, teamId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  update(@Param('teamId') teamId: string, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.contentService.update(id, teamId, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  remove(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.contentService.remove(id, teamId);
  }
}

