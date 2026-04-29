'use client'

import { BarChart2, Briefcase, CreditCard, Palette, Receipt, Settings2, ShieldCheck, User } from 'lucide-react'

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

const DESKTOP_GROUPS = [
  { label: 'ACCOUNT', ids: ['profile', 'billing', 'payment', 'usage'] },
  { label: 'PREFERENCES', ids: ['appearance', 'experience'] },
  { label: 'DANGER', ids: ['account'] },
]

interface SettingsSectionNavProps {
  activeSection: string
  onSectionChange: (sectionId: string) => void
  sections: Array<{ id: string; label: string }>
}

export default function SettingsSectionNav({
  activeSection,
  onSectionChange,
  sections,
}: SettingsSectionNavProps) {
  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s]))

  return (
    <nav className="sticky top-24">
      <div className="rounded-xl border border-border/60 bg-surface/50 p-1.5">
        <div className="flex flex-col">
          {DESKTOP_GROUPS.map((group) => {
            const groupSections = group.ids.map((id) => sectionMap[id]).filter(Boolean)
            if (groupSections.length === 0) return null
            return (
              <div key={group.label}>
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted/60 first:pt-1">
                  {group.label}
                </p>
                {groupSections.map((section) => {
                  const active = section.id === activeSection
                  const Icon = SECTION_ICONS[section.id] ?? Settings2
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => onSectionChange(section.id)}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                        active
                          ? 'border-l-2 border-accent bg-surface-raised font-medium text-foreground shadow-soft'
                          : 'border-l-2 border-transparent text-muted hover:bg-surface-raised/60 hover:text-foreground'
                      }`}
                    >
                      <Icon size={14} className={active ? 'text-accent' : 'text-muted group-hover:text-foreground'} />
                      {section.label}
                    </button>
                  )
                })}
              </div>
            )
          })}
          {sectionMap['admin'] && (
            <button
              type="button"
              onClick={() => onSectionChange('admin')}
              className={`group mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                activeSection === 'admin'
                  ? 'border-l-2 border-accent bg-surface-raised font-medium text-foreground shadow-soft'
                  : 'border-l-2 border-transparent text-muted hover:bg-surface-raised/60 hover:text-foreground'
              }`}
            >
              <ShieldCheck size={14} className={activeSection === 'admin' ? 'text-accent' : 'text-muted group-hover:text-foreground'} />
              {sectionMap['admin'].label}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
