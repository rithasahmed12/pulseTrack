-- =============================================================================
-- PulseTrack — Advisor cleanup migration
-- Applied 2026-05-12 as `advisor_fixes` after `initial_schema`.
-- Fixes flagged by mcp__supabase__get_advisors after the initial migration.
-- =============================================================================

-- Move pg_net out of the public schema (drop+recreate, no data dependent yet).
create schema if not exists extensions;
drop extension if exists pg_net;
create extension pg_net with schema extensions;

-- Lock down handle_new_user RPC surface (trigger context still works because
-- it runs as the function owner, not the calling role).
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Drop the broad storage SELECT policy. Public buckets serve object URLs
-- without this; removing it prevents anonymous directory listing.
drop policy if exists "media public read" on storage.objects;

-- Cover the activity_log → tracked_accounts foreign key.
create index if not exists activity_log_tracked_account_idx
  on activity_log(tracked_account_id);

-- Replace every RLS policy with a cached auth.uid() lookup so Postgres
-- evaluates the function once per query instead of once per row.
drop policy if exists "profiles self read" on profiles;
drop policy if exists "profiles self update" on profiles;
drop policy if exists "profiles self insert" on profiles;
drop policy if exists "tracked self" on tracked_accounts;
drop policy if exists "posts of own tracked" on posts;
drop policy if exists "activity self" on activity_log;
drop policy if exists "snapshots of own tracked" on follower_snapshots;
drop policy if exists "jobs of own tracked" on scrape_jobs;
drop policy if exists "hashtags readable" on hashtags;

create policy "profiles self read"
  on profiles for select using ((select auth.uid()) = id);
create policy "profiles self update"
  on profiles for update using ((select auth.uid()) = id);
create policy "profiles self insert"
  on profiles for insert with check ((select auth.uid()) = id);

create policy "tracked self"
  on tracked_accounts for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "posts of own tracked"
  on posts for all using (
    tracked_account_id in (
      select id from tracked_accounts where user_id = (select auth.uid())
    )
  );

create policy "activity self"
  on activity_log for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "snapshots of own tracked"
  on follower_snapshots for all using (
    tracked_account_id in (
      select id from tracked_accounts where user_id = (select auth.uid())
    )
  );

create policy "jobs of own tracked"
  on scrape_jobs for all using (
    tracked_account_id in (
      select id from tracked_accounts where user_id = (select auth.uid())
    )
  );

create policy "hashtags readable"
  on hashtags for select using ((select auth.uid()) is not null);
