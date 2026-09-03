'use client'

import React, { ComponentProps } from 'react'

import { useTranslations } from 'next-intl'

import { IconAlertCircle } from '@tabler/icons-react'
import { type VariantProps, cva } from 'class-variance-authority'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { cn } from '@/lib/utils'

const alertVariants = cva('transition-colors', {
  variants: {
    variant: {
      warning:
        'border-amber-500/50 text-amber-900 bg-amber-50/50 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-500/30 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
      info: 'border-blue-500/50 text-blue-900 bg-blue-50/50 dark:bg-blue-950/20 dark:text-blue-200 dark:border-blue-500/30 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
      success:
        'border-emerald-500/50 text-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 dark:text-emerald-200 dark:border-emerald-500/30 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400',
      destructive:
        'border-destructive/50 text-destructive bg-destructive/10 dark:border-destructive dark:bg-destructive/20 [&>svg]:text-destructive',
    },
  },
  defaultVariants: {
    variant: 'warning',
  },
})

export interface ActionRequiredAlertProps
  extends
    Omit<ComponentProps<typeof Alert>, 'title' | 'variant'>,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function ActionRequiredAlert({
  title,
  description,
  icon = <IconAlertCircle className="h-5 w-5" />,
  variant = 'warning',
  action,
  className,
  ...props
}: ActionRequiredAlertProps) {
  const t = useTranslations('merchant.shell.actionRequired')
  const alertTitle = title ?? t('title')
  const alertDescription = description ?? t('description')
  return (
    <Alert
      className={cn(
        'flex flex-col justify-between gap-4 sm:flex-row sm:items-center',
        alertVariants({ variant }),
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <AlertTitle className="flex flex-wrap items-center gap-2 font-semibold">
          {icon}
          {alertTitle}
        </AlertTitle>
        {alertDescription && (
          <AlertDescription className="mt-1 leading-relaxed">
            {alertDescription}
          </AlertDescription>
        )}
      </div>

      {action && (
        <div className="shrink-0 self-end sm:self-center">{action}</div>
      )}
    </Alert>
  )
}
