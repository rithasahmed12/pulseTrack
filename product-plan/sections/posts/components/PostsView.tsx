import { useEffect, useMemo, useRef } from 'react'
import { Loader2, Inbox } from 'lucide-react'
import { FilterBar } from './FilterBar'
import { PostCard } from './PostCard'
import type {
  Post,
  PostsProps,
} from '../types'

export function PostsView({
  posts,
  filterControls,
  dateRangeOptions,
  pagination,
  onPostTypeChange,
  onPlatformChange,
  onDateRangeChange,
  onMinEngagementChange,
  onResetFilters,
  onPostClick,
  onLoadMore,
}: PostsProps) {
  const visible = useMemo(() => applyFilters(posts, filterControls), [posts, filterControls])
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // IntersectionObserver — fires onLoadMore when the sentinel enters the viewport
  useEffect(() => {
    if (!pagination.hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onLoadMore?.()
            break
          }
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pagination.hasMore, onLoadMore])

  const totalCount = posts.length
  const visibleCount = visible.length
  const hasResults = visibleCount > 0

  return (
    <div>
      <FilterBar
        controls={filterControls}
        dateRangeOptions={dateRangeOptions}
        totalCount={totalCount}
        visibleCount={visibleCount}
        onPostTypeChange={onPostTypeChange}
        onPlatformChange={onPlatformChange}
        onDateRangeChange={onDateRangeChange}
        onMinEngagementChange={onMinEngagementChange}
        onResetFilters={onResetFilters}
      />

      {!hasResults ? (
        <EmptyState onResetFilters={onResetFilters} />
      ) : (
        <>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
          >
            {visible.map((post, idx) => (
              <div
                key={post.id}
                style={{
                  animation: `posts-rise 0.35s ease-out ${Math.min(idx, 16) * 0.025}s both`,
                }}
              >
                <PostCard post={post} onClick={() => onPostClick?.(post)} />
              </div>
            ))}
          </div>

          {/* Infinite-scroll sentinel */}
          <div
            ref={sentinelRef}
            className="mt-6 flex items-center justify-center py-6"
            aria-live="polite"
          >
            {pagination.hasMore ? (
              <span className="inline-flex items-center gap-2 text-[12px] text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-300" />
                Loading more posts…
              </span>
            ) : (
              <p className="font-mono text-center text-[10.5px] uppercase tracking-[0.22em] text-slate-600">
                · all caught up ·
              </p>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes posts-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function EmptyState({ onResetFilters }: { onResetFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E1E2E] bg-[#0F0F18]/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16161F] ring-1 ring-inset ring-[#1E1E2E]">
        <Inbox className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight text-slate-100">
        No posts match these filters
      </h3>
      <p className="mt-1 max-w-md text-[13px] text-slate-400">
        Try lowering the minimum engagement floor or widening the date range — or reset everything.
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-4 rounded-md border border-[#1E1E2E] bg-[#0F0F18] px-3 py-1.5 text-[12.5px] text-slate-300 hover:border-violet-500/30 hover:text-slate-100"
      >
        Reset filters
      </button>
    </div>
  )
}

function applyFilters(posts: Post[], controls: PostsProps['filterControls']): Post[] {
  let out = posts

  if (controls.postType !== 'all') {
    out = out.filter((p) => p.postType === controls.postType)
  }

  if (controls.platform !== 'both') {
    out = out.filter((p) => p.platform === controls.platform)
  }

  if (controls.minEngagement > 0) {
    out = out.filter((p) => p.engagementRate >= controls.minEngagement)
  }

  const cutoff = Date.now() - dateRangeMs(controls.dateRange)
  out = out.filter((p) => new Date(p.postedAt).getTime() >= cutoff)

  return out.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  )
}

function dateRangeMs(range: PostsProps['filterControls']['dateRange']): number {
  switch (range) {
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case '30d': return 30 * 24 * 60 * 60 * 1000
    case '90d': return 90 * 24 * 60 * 60 * 1000
  }
}
