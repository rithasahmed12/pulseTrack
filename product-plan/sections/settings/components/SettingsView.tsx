import { SettingsNav } from './SettingsNav'
import { SecurityPane } from './SecurityPane'
import { NotificationsPane } from './NotificationsPane'
import { AppearancePane } from './AppearancePane'
import { DataPane } from './DataPane'
import type { SettingsProps } from '../types'

export function SettingsView({
  tabs,
  activeTab,
  security,
  notificationPreferences,
  accentOptions,
  appearance,
  onTabChange,
  onPasswordSubmit,
  onTwoFactorToggle,
  onSetUp2FAClick,
  onNotificationToggle,
  onAccentChange,
  onSidebarDefaultToggle,
  onClearCache,
  onExportCsv,
  onDeleteAccount,
}: SettingsProps) {
  const tab = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
          Workspace · Settings
        </p>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
          Settings
        </h1>
        <p className="mt-0.5 text-[13px] text-slate-400">
          Tune your workspace — security, notifications, appearance, and data controls.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SettingsNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

        <div className="min-w-0">
          {/* Pane header */}
          <div className="mb-4 hidden lg:block">
            <h2 className="text-[16px] font-semibold tracking-tight text-slate-100">
              {tab.label}
            </h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">{tab.description}</p>
          </div>

          {/* Pane content */}
          <div key={activeTab} style={{ animation: 'pane-rise 0.25s ease-out both' }}>
            {activeTab === 'security' && (
              <SecurityPane
                security={security}
                onPasswordSubmit={onPasswordSubmit}
                onTwoFactorToggle={onTwoFactorToggle}
                onSetUp2FAClick={onSetUp2FAClick}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsPane
                preferences={notificationPreferences}
                onToggle={onNotificationToggle}
              />
            )}
            {activeTab === 'appearance' && (
              <AppearancePane
                accentOptions={accentOptions}
                appearance={appearance}
                onAccentChange={onAccentChange}
                onSidebarDefaultToggle={onSidebarDefaultToggle}
              />
            )}
            {activeTab === 'data' && (
              <DataPane
                onClearCache={onClearCache}
                onExportCsv={onExportCsv}
                onDeleteAccount={onDeleteAccount}
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pane-rise {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
