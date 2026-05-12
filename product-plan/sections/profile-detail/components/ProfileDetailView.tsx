import { Activity, TrendingUp, PieChart as PieIcon } from 'lucide-react'
import { ProfileHero } from './ProfileHero'
import { LineChart, AreaChart, DonutChart } from './Charts'
import { ProfilePostCard } from './ProfilePostCard'
import { TopPostHighlight } from './TopPostHighlight'
import { QuickStatsPanel } from './QuickStatsPanel'
import type { ProfileDetailProps } from '../types'

export function ProfileDetailView({
  profile,
  isTracked,
  engagementSeries,
  followerSeries,
  postTypeBreakdown,
  recentPosts,
  topPost,
  quickStats,
  onTrackProfile,
  onRemoveTracking,
  onPostClick,
  onTopPostClick,
  onPostTypeClick,
}: ProfileDetailProps) {
  return (
    <div className="space-y-5">
      <ProfileHero
        profile={profile}
        isTracked={isTracked}
        onTrackProfile={onTrackProfile}
        onRemoveTracking={onRemoveTracking}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-6">
        {/* Left column (2/3) */}
        <div className="space-y-5 lg:col-span-2">
          {/* Engagement chart */}
          <ChartCard
            icon={<Activity className="h-3.5 w-3.5 text-violet-300" />}
            title="Engagement rate"
            subtitle="Last 30 days · daily"
            currentValue={`${profile.engagementRate.toFixed(2)}%`}
            currentLabel="Current"
          >
            <LineChart
              series={engagementSeries}
              unitSuffix="%"
              accent="#7C3AED"
              ariaLabel="Engagement rate over the last 30 days"
            />
          </ChartCard>

          {/* Follower growth chart */}
          <ChartCard
            icon={<TrendingUp className="h-3.5 w-3.5 text-cyan-300" />}
            title="Follower growth"
            subtitle="Last 30 days · daily"
            currentValue={formatGrowth(followerSeries)}
            currentLabel="30-day net"
          >
            <AreaChart
              series={followerSeries}
              accent="#06B6D4"
              ariaLabel="Follower count over the last 30 days"
            />
          </ChartCard>

          {/* Recent posts */}
          <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#1A1A24] px-4 py-3">
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
                  Recent posts
                </h2>
                <p className="text-[11.5px] text-slate-500">Latest five — hover for full metrics.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
              {recentPosts.map((post, idx) => (
                <div
                  key={post.id}
                  style={{
                    animation: `pd-rise 0.4s ease-out ${Math.min(idx, 6) * 0.05}s both`,
                  }}
                >
                  <ProfilePostCard
                    post={post}
                    isTopPost={post.id === topPost.id}
                    onClick={() => onPostClick?.(post)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column (1/3) — sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-[80px] lg:self-start">
          {/* Donut */}
          <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-[#1A1A24] px-4 py-3">
              <PieIcon className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.8} />
              <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
                Post types
              </h2>
            </div>
            <div className="p-4">
              <DonutChart slices={postTypeBreakdown} onSliceClick={onPostTypeClick} />
            </div>
          </section>

          {/* Top post highlight */}
          <TopPostHighlight post={topPost} onClick={() => onTopPostClick?.(topPost)} />

          {/* Quick stats */}
          <QuickStatsPanel stats={quickStats} />
        </aside>
      </div>

      <style>{`
        @keyframes pd-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function ChartCard({
  icon,
  title,
  subtitle,
  currentValue,
  currentLabel,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  currentValue: string
  currentLabel: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1E1E2E] bg-[#0F0F18]/85 backdrop-blur-xl">
      <div className="flex items-end justify-between gap-3 border-b border-[#1A1A24] px-4 py-3">
        <div>
          <div className="flex items-center gap-1.5">
            {icon}
            <h2 className="text-[14px] font-semibold tracking-tight text-slate-100">
              {title}
            </h2>
          </div>
          <p className="text-[11.5px] text-slate-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-[18px] font-semibold leading-none tracking-tight text-slate-50 tabular-nums">
            {currentValue}
          </p>
          <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-500">
            {currentLabel}
          </p>
        </div>
      </div>
      <div className="px-2 py-3 sm:px-4">{children}</div>
    </section>
  )
}

function formatGrowth(series: { value: number }[]): string {
  if (series.length < 2) return '—'
  const delta = series[series.length - 1].value - series[0].value
  const sign = delta >= 0 ? '+' : '−'
  const abs = Math.abs(delta)
  const formatted =
    abs >= 1_000_000
      ? (abs / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
      : abs >= 1_000
      ? (abs / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
      : abs.toFixed(0)
  return `${sign}${formatted}`
}
