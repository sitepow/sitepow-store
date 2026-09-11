'use client'

import React from 'react'

import { DialogDescription, DialogTitle } from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

interface DialogHeaderIconProps {
  icon: React.ElementType<{ className?: string }>
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
  iconClassName?: string
}

export function DialogHeaderIcon({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
}: DialogHeaderIconProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'border-primary/20 bg-primary/10 text-primary rounded-xl border p-2.5',
          iconClassName,
        )}
      >
        <Icon className="size-6" />
      </div>
      <div>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-muted-foreground mt-0.5 text-xs">
            {description}
          </DialogDescription>
        )}
      </div>
    </div>
  )
}
