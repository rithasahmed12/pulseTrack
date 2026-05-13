import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Pagination, Post, TopPost } from '@pulsetrack/shared-types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PostsListQueryDto, PostsListResponseDto, TopPostsResponseDto } from './dto/posts-list-query.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List posts across all tracked accounts (filtered, paginated).' })
  @ApiOkResponse({ type: PostsListResponseDto })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PostsListQueryDto,
  ): Promise<{ posts: Post[]; pagination: Pagination }> {
    return this.posts.list(user.jwt, query);
  }

  @Get('top-performing')
  @ApiOperation({ summary: 'Top 6 posts by engagement_rate across tracked accounts.' })
  @ApiOkResponse({ type: TopPostsResponseDto })
  async topPerforming(@CurrentUser() user: AuthenticatedUser): Promise<{ posts: TopPost[] }> {
    return { posts: await this.posts.topPerforming(user.jwt) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single post (full detail).' })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Post> {
    return this.posts.getById(user.jwt, id);
  }
}
