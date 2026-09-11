'use client'

import React, { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'

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
  style?: React.CSSProperties
}

export function AnalyticsCardShell({
  title,
  description,
  isEmpty = false,
  emptyMessage,
  children,
  className,
  style,
}: AnalyticsCardShellProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('common.empty')
  const resolvedEmptyMessage = emptyMessage ?? t('title')

  return (
    <Card
      className={`border-border/60 overflow-hidden ${className ?? ''}`}
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          ...style,
        } as React.CSSProperties
      }
    >
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
