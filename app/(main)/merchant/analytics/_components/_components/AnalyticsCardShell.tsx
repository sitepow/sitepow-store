'use client'

import { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

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
  children?: ReactNode
  className?: string
}

export function AnalyticsCardShell({
  title,
  description,
  isEmpty = false,
  emptyMessage,
  children,
  className,
}: AnalyticsCardShellProps) {
  const t = useTranslations('common.empty')
  const resolvedEmptyMessage = emptyMessage ?? t('title')

  return (
    <Card className={`border-border/60 overflow-hidden ${className ?? ''}`}>
      <CardHeader>
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            {resolvedEmptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
