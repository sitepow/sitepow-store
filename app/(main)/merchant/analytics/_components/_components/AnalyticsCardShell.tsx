'use client'

import { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AnalyticsCardShellProps {
  title: string
  description: string
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
  className?: string
}

export function AnalyticsCardShell({
  title,
  description,
  isEmpty = false,
  emptyMessage = 'ไม่มีข้อมูล',
  children,
  className,
}: AnalyticsCardShellProps) {
  return (
    <Card className={`border-border/60 overflow-hidden ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
