'use client'

import { useTranslations } from 'next-intl'

import { formatDateTime } from '@/utils/date'
import { CalendarIcon, Clock, User2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

interface BlogMetaBadgeProps {
  authorName?: string
  authorAvatar?: string
  createdAt: string | Date
  readingTime?: number
  className?: string
}

export function BlogMetaBadge({
  authorName,
  authorAvatar,
  createdAt,
  readingTime,
  className,
}: BlogMetaBadgeProps) {
  const t = useTranslations('storefront.blogs')
  const displayAuthorName = authorName || t('adminAuthor')

  return (
    <div
      className={cn(
        'bg-card text-muted-foreground border-border flex w-fit flex-wrap items-center justify-center gap-4 rounded-full border px-4 py-1.5 text-xs shadow-xs md:text-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar className="size-6 border">
          <AvatarImage src={authorAvatar} alt={displayAuthorName} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User2 size={14} />
          </AvatarFallback>
        </Avatar>
        <span className="text-foreground font-medium">{displayAuthorName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <CalendarIcon className="size-3.5" />
        <span>{formatDateTime(createdAt)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="size-3.5" />
        <span>{t('readTime', { time: readingTime ?? 0 })}</span>
      </div>
    </div>
  )
}
