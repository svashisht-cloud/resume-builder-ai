'use client'

import { BarChart2, Briefcase, ChevronRight, CreditCard, Palette, Receipt, Settings2, ShieldCheck, User } from 'lucide-react'

const SECTION_ICONS: Record<string, React.ElementType> = {
  profile: User,
  billing: CreditCard,
  payment: Receipt,
  usage: BarChart2,
  appearance: Palette,
  experience: Briefcase,
  account: Settings2,
  admin: ShieldCheck,
}

const MOBILE_GROUPS = [
  { label: 'ACCOUNT',     ids: ['profile', 'billing', 'payment', 'usage'], danger: false },
  { label: 'PREFERENCES', ids: ['appearance', 'experience'],                danger: false },
  { label: 'DANGER',      ids: ['account'],                                 danger: true  },
  { label: 'ADMIN',       ids: ['admin'],                                   danger: false },
]

interface MobileSettingsIndexProps {
  sections: Array<{ id: string; label: string }>
  onSelect: (sectionId: string) => void
}

export default function MobileSettingsIndex({ sections, onSelect }: MobileSettingsIndexProps) {
  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s]))

  return (
    <div className="space-y-5">
      {MOBILE_GROUPS.map((group) => {
        const groupSections = group.ids.map((id) => sectionMap[id]).filter(Boolean)
        if (groupSections.length === 0) return null

        return (
          <div key={group.label}>
            <p
              className={`mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider ${
                group.danger ? 'text-danger-fg' : 'text-muted/60'
              }`}
            >
              {group.label}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface/80 shadow-[0_10px_26px_rgba(0,0,0,0.08)] backdrop-blur-sm">
              {groupSections.map((section) => {
                const Icon = SECTION_ICONS[section.id] ?? Settings2
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelect(section.id)}
                    className="flex min-h-[52px] w-full items-center gap-3.5 border-b border-border/30 px-4 py-3.5 text-left transition-transform duration-100 last:border-b-0 active:scale-[0.98] active:bg-surface-raised/50"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent/10 text-accent">
                      <Icon size={16} />
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-foreground">
                      {section.label}
                    </span>
                    <ChevronRight size={16} className="flex-shrink-0 text-foreground/25" />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
