'use client'

import { useState } from 'react'

export default function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const [hovering, setHovering] = useState(false)
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x, y })
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  function handleMouseEnter() {
    if (!prefersReducedMotion) setHovering(true)
  }

  function handleMouseLeave() {
    setHovering(false)
    setTilt({ x: 0, y: 0 })
  }

  const active = hovering && !prefersReducedMotion

  const transform = active
    ? `perspective(800px) rotateX(${-tilt.y * 8}deg) rotateY(${tilt.x * 8}deg) scale3d(1.02, 1.02, 1.02)`
    : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'

  // Directional border: each edge lights up in proportion to how close the cursor is to it.
  // tilt.x and tilt.y range from -0.5 to 0.5.
  const top = active ? Math.max(0, -tilt.y) * 160 : 0
  const bottom = active ? Math.max(0, tilt.y) * 160 : 0
  const right = active ? Math.max(0, tilt.x) * 160 : 0
  const left = active ? Math.max(0, -tilt.x) * 160 : 0
  const borderTransition = active ? 'border-color 60ms linear' : 'border-color 600ms cubic-bezier(0.23, 1, 0.32, 1)'

  return (
    <div
      className={className}
      style={{
        transform,
        transition: active
          ? 'transform 0ms linear'
          : 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* Directional border overlay */}
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderTopColor: `color-mix(in srgb, var(--accent) ${top}%, transparent)`,
            borderRightColor: `color-mix(in srgb, var(--accent) ${right}%, transparent)`,
            borderBottomColor: `color-mix(in srgb, var(--accent) ${bottom}%, transparent)`,
            borderLeftColor: `color-mix(in srgb, var(--accent) ${left}%, transparent)`,
            transition: borderTransition,
          }}
        />
      )}
      {/* Glare overlay */}
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            opacity: active ? 1 : 0,
            transition: 'opacity 200ms',
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.07), transparent 60%)`,
          }}
        />
      )}
    </div>
  )
}
