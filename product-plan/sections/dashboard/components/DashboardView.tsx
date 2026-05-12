import { ArrowUpRight } from 'lucide-react'
import { StatCard } from './StatCard'
import { TopPostCard } from './TopPostCard'
import { ActivityFeed } from './ActivityFeed'
import { TimeRangeSelector } from './TimeRangeSelector'
import type { DashboardProps } from '../types'

export function DashboardView({
  currentUser,
  timeRange,
  timeRangeOptions,
  stats,
  topPosts,
  activity,
  onTimeRangeChange,
  onViewAllPostsClick,
  onPostClick,
  onActivityProfileClick,
  onViewAllActivityClick,
}: DashboardProps) {
  const greeting = getGreeting()
  const currentRangeLong =
    timeRangeOptions.find((o) => o.id === timeRange)?.longLabel ?? 'Last 7 days'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
            {currentRangeLong}
          </p>
          <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
              {currentUser.firstName}
            </span>
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Here's what's been moving across your tracked profiles.
          </p>
        </div>

        <TimeRangeSelector
          value={timeRange}
          options={timeRangeOptions}
          onChange={onTimeRangeChange}
        />
      </header>

      {/* Stat cards row */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      {/* Two-column body */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-6">
        {/* Top posts (left, 2/3) */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#1A1A24] px-4 py-3">
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
                  Top performing posts
                </h2>
                <p className="text-[11.5px] text-slate-500">
                  Ranked by engagement rate · {currentRangeLong.toLowerCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={onViewAllPostsClick}
                className="inline-flex items-center gap-0.5 text-[12px] font-medium text-violet-300 hover:text-violet-200"
              >
                View all
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {topPosts.map((post, idx) => (
                <div
                  key={post.id}
                  style={{
                    animation: `dash-rise 0.4s ease-out ${Math.min(idx, 8) * 0.05}s both`,
                  }}
                >
                  <TopPostCard
                    post={post}
                    rank={idx + 1}
                    onClick={() => onPostClick?.(post)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity feed (right, 1/3, sticky on desktop) */}
        <aside className="lg:sticky lg:top-[80px] lg:self-start">
          <ActivityFeed
            events={activity}
            onProfileClick={onActivityProfileClick}
            onViewAllClick={onViewAllActivityClick}
          />
        </aside>
      </section>

      <style>{`
        @keyframes dash-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
