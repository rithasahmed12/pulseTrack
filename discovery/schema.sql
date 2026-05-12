-- =============================================================================
-- PulseTrack — Initial Database Schema
-- Project ref: hdbhbhwdnjctfcuiavrc (eu-central-1)
-- =============================================================================
-- Changes vs original plan after Phase 0 Apify discovery:
--   - tracked_accounts.joined_at  added (nullable; only TikTok exposes it)
--   - posts.shares_count          stays nullable (IG does not expose)
--   - posts.saves_count           stays nullable (IG does not expose)
--   - posts.views_count           stays nullable (IG photos do not expose)
--   - posts.video_duration_seconds added (optional, for richer detail modal)
-- =============================================================================

create extension if not exists "uuid-ossp";

-- pg_net is needed later for pg_cron → NestJS webhook. Enable now so the
-- second migration can simply schedule the job without re-running extensions.
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------------
-- profiles  (the PulseTrack analyst)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  bio text,
  accent_color text default 'violet'
    check (accent_color in ('violet','cyan','rose','amber')),
  sidebar_starts_collapsed boolean default false,
  notifications jsonb default jsonb_build_object(
    'new_post', true,
    'follower_spike', true,
    'trending_hashtag', true,
    'weekly_report', false
  ),
  two_factor_enabled boolean default false,
  last_password_change_at timestamptz,
  created_at timestamptz default now()
);

-- Auto-create a profiles row whenever an auth.users row is created.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- tracked_accounts  (one IG or TikTok profile the analyst monitors)
-- ---------------------------------------------------------------------------
create table tracked_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  platform text not null check (platform in ('instagram','tiktok')),
  username text not null,
  display_name text,
  avatar_url text,
  bio text,
  is_verified boolean default false,
  joined_at timestamptz,                            -- TikTok only; null on IG
  followers_count bigint default 0,
  following_count bigint default 0,
  posts_count int default 0,
  engagement_rate numeric(5,2) default 0,
  last_scraped_at timestamptz,
  scrape_status text default 'idle'
    check (scrape_status in ('idle','scraping','failed')),
  scrape_error text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id, platform, username)
);

create index tracked_accounts_user_id_idx on tracked_accounts(user_id);
create index tracked_accounts_due_idx
  on tracked_accounts(last_scraped_at)
  where is_active = true;

-- ---------------------------------------------------------------------------
-- posts  (a scraped post tied to a tracked_account)
-- ---------------------------------------------------------------------------
create table posts (
  id uuid primary key default gen_random_uuid(),
  tracked_account_id uuid references tracked_accounts(id) on delete cascade not null,
  platform text not null check (platform in ('instagram','tiktok')),
  platform_post_id text not null,
  post_type text check (post_type in ('photo','video','carousel','reel')),
  caption text,
  thumbnail_url text,
  media_urls text[],
  likes_count bigint default 0,
  comments_count bigint default 0,
  shares_count bigint,         -- IG: null, TikTok: shareCount
  saves_count bigint,          -- IG: null, TikTok: collectCount
  views_count bigint,          -- IG photos: null, IG videos/reels: videoViewCount, TikTok: playCount
  engagement_rate numeric(5,2) default 0,
  hashtags text[] default '{}',
  video_duration_seconds numeric(8,2),
  posted_at timestamptz,
  scraped_at timestamptz default now(),
  raw_data jsonb,
  unique(platform, platform_post_id)
);

create index posts_tracked_account_id_idx on posts(tracked_account_id);
create index posts_posted_at_idx on posts(posted_at desc);
create index posts_engagement_rate_idx on posts(engagement_rate desc);
create index posts_hashtags_gin_idx on posts using gin (hashtags);

-- ---------------------------------------------------------------------------
-- hashtags  (aggregate counts for trending list + tag cloud)
-- ---------------------------------------------------------------------------
create table hashtags (
  id uuid primary key default gen_random_uuid(),
  tag text unique not null,
  usage_count bigint default 0,
  prev_window_count bigint default 0,
  growth_percent numeric(7,2) default 0,
  last_seen_at timestamptz default now()
);

create index hashtags_usage_count_idx on hashtags(usage_count desc);

-- ---------------------------------------------------------------------------
-- activity_log  (timeline for dashboard sidebar; streamed via Realtime)
-- ---------------------------------------------------------------------------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  tracked_account_id uuid references tracked_accounts(id) on delete set null,
  event_type text not null check (event_type in (
    'new_post','follower_spike','trending_hashtag','scrape_complete','scrape_failed'
  )),
  platform text check (platform in ('instagram','tiktok')),
  message text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index activity_log_user_created_idx on activity_log(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- follower_snapshots  (point-in-time history for growth charts)
-- ---------------------------------------------------------------------------
create table follower_snapshots (
  id uuid primary key default gen_random_uuid(),
  tracked_account_id uuid references tracked_accounts(id) on delete cascade not null,
  followers_count bigint not null,
  recorded_at timestamptz default now()
);

create index follower_snapshots_account_recorded_idx
  on follower_snapshots(tracked_account_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- scrape_jobs  (one row per Apify run, success or failure)
-- ---------------------------------------------------------------------------
create table scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  tracked_account_id uuid references tracked_accounts(id) on delete cascade not null,
  status text not null check (status in ('pending','running','completed','failed')),
  apify_run_id text,
  apify_dataset_id text,
  posts_scraped int default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index scrape_jobs_account_created_idx
  on scrape_jobs(tracked_account_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table tracked_accounts enable row level security;
alter table posts enable row level security;
alter table activity_log enable row level security;
alter table follower_snapshots enable row level security;
alter table scrape_jobs enable row level security;
alter table hashtags enable row level security;

create policy "profiles self read"   on profiles for select using (auth.uid() = id);
create policy "profiles self update" on profiles for update using (auth.uid() = id);
create policy "profiles self insert" on profiles for insert with check (auth.uid() = id);

create policy "tracked self"         on tracked_accounts for all   using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts of own tracked" on posts for all using (
  tracked_account_id in (select id from tracked_accounts where user_id = auth.uid())
);

create policy "activity self"        on activity_log for all       using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "snapshots of own tracked" on follower_snapshots for all using (
  tracked_account_id in (select id from tracked_accounts where user_id = auth.uid())
);

create policy "jobs of own tracked"  on scrape_jobs for all using (
  tracked_account_id in (select id from tracked_accounts where user_id = auth.uid())
);

-- hashtags are global aggregates — readable by any authenticated user, only the
-- service-role NestJS process writes to them.
create policy "hashtags readable" on hashtags for select using (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Realtime publication for activity_log
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table activity_log;

-- ---------------------------------------------------------------------------
-- Storage bucket for avatars + post thumbnails
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Authenticated users can manage their own files under a folder named by their uid.
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media owner write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
