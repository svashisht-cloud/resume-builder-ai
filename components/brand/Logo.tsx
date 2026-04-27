import Image from 'next/image'
import { Sora } from 'next/font/google'

const sora = Sora({ subsets: ['latin'], weight: ['400', '600'] })

export type LogoTone = 'light' | 'dark' | 'auto'
export type LogoVariant = 'mark' | 'horizontal' | 'stacked'

export interface LogoProps {
  variant?: LogoVariant
  tone: LogoTone
  className?: string
  priority?: boolean
}

// tone="light" → on a light background → use dark icon
// tone="dark"  → on a dark background  → use light icon
const MARK_SOURCES: Record<LogoTone, string> = {
  light: '/brand/forte-icon-sora-dark.svg',
  dark:  '/brand/forte-icon-sora-light.svg',
  auto:  '/brand/forte-icon-sora-light.svg',
}

export function Logo({ variant = 'horizontal', tone, className, priority = false }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span className={`inline-flex items-center ${className ?? ''}`}>
        <Image
          src={MARK_SOURCES[tone]}
          alt="Forte"
          width={100}
          height={100}
          className="h-full w-auto"
          unoptimized
          priority={priority}
        />
      </span>
    )
  }

  const textColor = tone === 'dark' ? 'text-white' : tone === 'light' ? 'text-gray-900' : 'text-foreground'
  return (
    <span className={`inline-flex items-center ${sora.className} ${textColor} font-semibold tracking-tight ${className ?? ''}`}>
      forte
    </span>
  )
}
