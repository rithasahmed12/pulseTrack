import { Flame } from 'lucide-react'
import { TrendingPostRow } from './TrendingPostRow'
import { HashtagBlock } from './HashtagBlock'
import { PlatformCompareCards } from './PlatformCompareCards'
import { PostingTimeHeatmap } from './PostingTimeHeatmap'
import type { TrendingProps } from '../types'

export function TrendingView({
  trendingPosts,
  trendingHashtags,
  platformComparison,
  heatmap,
  onPostClick,
  onHashtagClick,
  onHeatmapCellClick,
}: TrendingProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-amber-300">
            <Flame className="h-3 w-3" strokeWidth={2.2} />
            Last 24 hours · live signal
          </p>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
            What's{' '}
            <span className="bg-gradient-to-r from-amber-200 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              trending
            </span>
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Velocity-ranked posts, growing hashtags, and the best windows to post.
          </p>
        </div>
      </header>

      {/* Section 1 — Trending Posts */}
      <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-[#1A1A24] px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
              Trending posts
            </h2>
            <p className="text-[11.5px] text-slate-500">
              Top 10 by 24-hour engagement velocity across all tracked profiles.
            </p>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
            10 posts
          </span>
        </div>
        <div className="flex flex-col gap-1.5 p-3 sm:p-4">
          {trendingPosts.map((post, idx) => (
            <div
              key={post.id}
              style={{
                animation: `tr-rise 0.35s ease-out ${Math.min(idx, 10) * 0.04}s both`,
              }}
            >
              <TrendingPostRow
                post={post}
                rank={idx + 1}
                onClick={() => onPostClick?.(post)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 — Trending Hashtags */}
      <HashtagBlock hashtags={trendingHashtags} onHashtagClick={onHashtagClick} />

      {/* Section 3 — Platform Comparison */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
            Platform comparison
          </h2>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-500">
            7-day avg engagement
          </span>
        </div>
        <PlatformCompareCards comparison={platformComparison} />
      </section>

      {/* Section 4 — Best Posting Times */}
      <PostingTimeHeatmap heatmap={heatmap} onCellClick={onHeatmapCellClick} />

      <style>{`
        @keyframes tr-rise {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
