'use client'

import { useState } from 'react'

interface AvatarImageProps {
  src: string | null
  initial: string
}

export default function AvatarImage({ src, initial }: AvatarImageProps) {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Avatar"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="h-16 w-16 flex-shrink-0 rounded-full border border-border object-cover"
      />
    )
  }

  return (
    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-display text-xl font-bold text-foreground">
      {initial}
    </div>
  )
}
