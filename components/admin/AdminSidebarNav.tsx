'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin/overview', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/credits', label: 'Credits' },
  { href: '/admin/system', label: 'System' },
]

export default function AdminSidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-surface-raised text-foreground font-medium' : 'text-muted hover:text-foreground hover:bg-surface-raised/60'}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
