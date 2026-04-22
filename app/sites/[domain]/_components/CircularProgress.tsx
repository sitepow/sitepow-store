'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
}

const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(({ value, size = 100, strokeWidth = 8, className, ...props }, ref) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      ref={ref}
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          className="text-muted stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary stroke-current transition-all duration-500 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-sm font-medium">{Math.round(value)}%</span>
    </div>
  )
})

CircularProgress.displayName = 'CircularProgress'
export { CircularProgress }
