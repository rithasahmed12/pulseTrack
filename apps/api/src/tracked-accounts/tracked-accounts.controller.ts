import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AddTrackedDto } from './dto/add-tracked.dto';
import { TrackedAccountDto } from './dto/tracked-account-response.dto';
import {
  TrackedAccountsListResponseDto,
  TrackedAccountsQueryDto,
} from './dto/tracked-accounts-query.dto';
import { TrackedAccountsService } from './tracked-accounts.service';

@ApiTags('tracked-accounts')
@ApiBearerAuth()
@Controller('tracked-accounts')
export class TrackedAccountsController {
  constructor(private readonly tracked: TrackedAccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'List tracked accounts owned by the current analyst (paginated, filterable).',
  })
  @ApiOkResponse({ type: TrackedAccountsListResponseDto })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TrackedAccountsQueryDto,
  ): Promise<TrackedAccountsListResponseDto> {
    return this.tracked.list(user.id, user.jwt, query);
  }

  @Post()
  @ApiOperation({ summary: 'Track a new IG / TikTok profile. Triggers an immediate scrape.' })
  @ApiOkResponse({ type: TrackedAccountDto })
  add(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddTrackedDto,
  ): Promise<TrackedAccountDto> {
    return this.tracked.add(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tracked account by id.' })
  @ApiOkResponse({ type: TrackedAccountDto })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TrackedAccountDto> {
    return this.tracked.getById(id, user.jwt);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete (deactivate) a tracked account.' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.tracked.remove(id, user.id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Hard-delete a tracked account. Cascades to posts, follower snapshots, and scrape jobs.',
  })
  async purge(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.tracked.purge(id, user.id);
  }

  @Post(':id/scrape')
  @ApiOperation({ summary: 'Trigger a fresh scrape of this account immediately.' })
  triggerScrape(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ jobId: string | null }> {
    return this.tracked.triggerScrape(id, user.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause monitoring (sets is_active=false). POST body unused.' })
  @ApiOkResponse({ type: TrackedAccountDto })
  pause(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TrackedAccountDto> {
    return this.tracked.pause(id, user.id, false);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume monitoring (sets is_active=true).' })
  @ApiOkResponse({ type: TrackedAccountDto })
  resume(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TrackedAccountDto> {
    return this.tracked.pause(id, user.id, true);
  }
}
