'use client'

import { useState } from 'react'

const EDGE_ACTIVATION_THRESHOLD = 0.34
const HORIZONTAL_SEGMENT_WIDTH = 38
const VERTICAL_SEGMENT_HEIGHT = 42
const CORNER_HIGHLIGHT_SIZE = 26

export default function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [pointer, setPointer] = useState({ x: 0, y: 0, xPercent: 50, yPercent: 50 })
  const [hovering, setHovering] = useState(false)
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100

    setPointer({
      x: xPercent / 100 - 0.5,
      y: yPercent / 100 - 0.5,
      xPercent,
      yPercent,
    })
  }

  function handleMouseEnter() {
    if (!prefersReducedMotion) setHovering(true)
  }

  function handleMouseLeave() {
    setHovering(false)
    setPointer({ x: 0, y: 0, xPercent: 50, yPercent: 50 })
  }

  const active = hovering && !prefersReducedMotion

  const transform = active
    ? `perspective(800px) rotateX(${-pointer.y * 8}deg) rotateY(${pointer.x * 8}deg) scale3d(1.02, 1.02, 1.02)`
    : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'

  const distances = {
    top: pointer.yPercent / 100,
    right: (100 - pointer.xPercent) / 100,
    bottom: (100 - pointer.yPercent) / 100,
    left: pointer.xPercent / 100,
  }

  function getEdgeOpacity(distance: number) {
    if (!active || distance >= EDGE_ACTIVATION_THRESHOLD) return 0
    return 1 - distance / EDGE_ACTIVATION_THRESHOLD
  }

  function getCornerOpacity(distanceA: number, distanceB: number) {
    return Math.min(getEdgeOpacity(distanceA), getEdgeOpacity(distanceB))
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  const horizontalStart = clamp(pointer.xPercent - HORIZONTAL_SEGMENT_WIDTH / 2, 6, 100 - HORIZONTAL_SEGMENT_WIDTH - 6)
  const verticalStart = clamp(pointer.yPercent - VERTICAL_SEGMENT_HEIGHT / 2, 6, 100 - VERTICAL_SEGMENT_HEIGHT - 6)

  const highlightTransition = active
    ? 'opacity 70ms linear, transform 70ms linear'
    : 'opacity 320ms cubic-bezier(0.23, 1, 0.32, 1), transform 320ms cubic-bezier(0.23, 1, 0.32, 1)'

  const cornerOpacities = {
    topLeft: getCornerOpacity(distances.top, distances.left),
    topRight: getCornerOpacity(distances.top, distances.right),
    bottomRight: getCornerOpacity(distances.bottom, distances.right),
    bottomLeft: getCornerOpacity(distances.bottom, distances.left),
  }

  return (
    <div
      className={`relative ${className ?? ''}`}
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
      {/* Localized edge highlights follow the cursor instead of tinting entire sides. */}
      {!prefersReducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <div
            className="absolute top-0 h-[1.5px]"
            style={{
              left: `${horizontalStart}%`,
              width: `${HORIZONTAL_SEGMENT_WIDTH}%`,
              opacity: getEdgeOpacity(distances.top),
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 86%, white 14%) 50%, transparent 100%)',
              transform: active ? 'translateY(0)' : 'translateY(-4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute bottom-0 h-[1.5px]"
            style={{
              left: `${horizontalStart}%`,
              width: `${HORIZONTAL_SEGMENT_WIDTH}%`,
              opacity: getEdgeOpacity(distances.bottom),
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 82%, white 18%) 50%, transparent 100%)',
              transform: active ? 'translateY(0)' : 'translateY(4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute right-0 w-[1.5px]"
            style={{
              top: `${verticalStart}%`,
              height: `${VERTICAL_SEGMENT_HEIGHT}%`,
              opacity: getEdgeOpacity(distances.right),
              background:
                'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 86%, white 14%) 50%, transparent 100%)',
              transform: active ? 'translateX(0)' : 'translateX(4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute left-0 w-[1.5px]"
            style={{
              top: `${verticalStart}%`,
              height: `${VERTICAL_SEGMENT_HEIGHT}%`,
              opacity: getEdgeOpacity(distances.left),
              background:
                'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 82%, white 18%) 50%, transparent 100%)',
              transform: active ? 'translateX(0)' : 'translateX(-4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute left-0 top-0"
            style={{
              width: `${CORNER_HIGHLIGHT_SIZE}px`,
              height: `${CORNER_HIGHLIGHT_SIZE}px`,
              opacity: cornerOpacities.topLeft,
              background:
                'radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 88%, white 12%) 0%, transparent 72%)',
              transform: active ? 'translate(0, 0)' : 'translate(-4px, -4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute right-0 top-0"
            style={{
              width: `${CORNER_HIGHLIGHT_SIZE}px`,
              height: `${CORNER_HIGHLIGHT_SIZE}px`,
              opacity: cornerOpacities.topRight,
              background:
                'radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 88%, white 12%) 0%, transparent 72%)',
              transform: active ? 'translate(0, 0)' : 'translate(4px, -4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: `${CORNER_HIGHLIGHT_SIZE}px`,
              height: `${CORNER_HIGHLIGHT_SIZE}px`,
              opacity: cornerOpacities.bottomRight,
              background:
                'radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent) 84%, white 16%) 0%, transparent 72%)',
              transform: active ? 'translate(0, 0)' : 'translate(4px, 4px)',
              transition: highlightTransition,
            }}
          />
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: `${CORNER_HIGHLIGHT_SIZE}px`,
              height: `${CORNER_HIGHLIGHT_SIZE}px`,
              opacity: cornerOpacities.bottomLeft,
              background:
                'radial-gradient(circle at bottom left, color-mix(in srgb, var(--accent) 84%, white 16%) 0%, transparent 72%)',
              transform: active ? 'translate(0, 0)' : 'translate(-4px, 4px)',
              transition: highlightTransition,
            }}
          />
        </div>
      )}
      {/* Glare overlay */}
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            opacity: active ? 1 : 0,
            transition: 'opacity 200ms',
            background: `radial-gradient(circle at ${pointer.xPercent}% ${pointer.yPercent}%, rgba(255,255,255,0.07), transparent 60%)`,
          }}
        />
      )}
    </div>
  )
}
