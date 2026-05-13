import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Pagination, Post, TopPost } from '@pulsetrack/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import { PostsListQueryDto } from './dto/posts-list-query.dto';
import { PostRow, toPost, toTopPost } from './posts.mapper';

const SELECT_COLUMNS = `
  id, platform, platform_post_id, post_type, caption, thumbnail_url, video_url, media_urls,
  likes_count, comments_count, shares_count, saves_count, views_count,
  engagement_rate, hashtags, posted_at, scraped_at,
  tracked_accounts!inner ( username, display_name )
`;

@Injectable()
export class PostsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(
    jwt: string,
    query: PostsListQueryDto,
  ): Promise<{ posts: Post[]; pagination: Pagination }> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.limit ?? 24;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const client = this.supabase.forUser(jwt);
    let q = client.from('posts').select(SELECT_COLUMNS, { count: 'exact' });

    if (query.type && query.type !== 'all') q = q.eq('post_type', query.type);
    if (query.platform && query.platform !== 'both') q = q.eq('platform', query.platform);
    if (query.accountId) q = q.eq('tracked_account_id', query.accountId);
    if (typeof query.minEngagement === 'number') q = q.gte('engagement_rate', query.minEngagement);
    if (query.dateFrom) q = q.gte('posted_at', query.dateFrom);
    if (query.dateTo) q = q.lte('posted_at', query.dateTo);
    if (query.q) {
      const term = query.q.trim();
      if (term) {
        const escaped = term.replace(/[,()*]/g, ' ');
        const bare = term.replace(/^#/, '');
        q = q.or(`caption.ilike.%${escaped}%,hashtags.cs.{${bare}}`);
      }
    }

    const sort = query.sortBy ?? 'posted-at';
    const sortColumn = sort === 'engagement' ? 'engagement_rate' : sort === 'likes' ? 'likes_count' : 'posted_at';
    q = q.order(sortColumn, { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);
    const rows = (data as unknown as PostRow[]) ?? [];
    const total = count ?? 0;
    const pageCount = total === 0 ? 0 : Math.ceil(total / pageSize);
    return {
      posts: rows.map(toPost),
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
        hasMore: page < pageCount,
      },
    };
  }

  async getById(jwt: string, id: string): Promise<Post> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client.from('posts').select(SELECT_COLUMNS).eq('id', id).single();
    if (error || !data) throw new NotFoundException('Post not found');
    return toPost(data as unknown as PostRow);
  }

  async topPerforming(jwt: string, limit = 6): Promise<TopPost[]> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('posts')
      .select(SELECT_COLUMNS)
      .order('engagement_rate', { ascending: false })
      .limit(limit);
    if (error) throw new BadRequestException(error.message);
    return ((data as unknown as PostRow[]) ?? []).map(toTopPost);
  }
}
