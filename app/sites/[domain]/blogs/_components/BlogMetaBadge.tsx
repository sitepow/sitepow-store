import { formatDateTime } from '@/utils/date'
import { CalendarIcon, Clock, User2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

interface BlogMetaBadgeProps {
  authorName?: string
  authorAvatar?: string
  createdAt: string | Date
  readingTime?: number
  bgImage?: string
  className?: string
}

export function BlogMetaBadge({
  authorName = 'ผู้ดูแลระบบ',
  authorAvatar,
  createdAt,
  readingTime,
  bgImage = '/images/hero-section/section-5.jpeg',
  className,
}: BlogMetaBadgeProps) {
  const hasBg = Boolean(bgImage)

  return (
    <div
      className={cn(
        'relative flex w-fit flex-wrap items-center justify-center gap-6 overflow-hidden rounded-2xl border p-3 px-6 text-sm shadow-xs',
        hasBg
          ? 'border-white/20 bg-cover bg-center text-white'
          : 'text-muted-foreground border-border/40 bg-background/60 backdrop-blur-md',
        className,
      )}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {bgImage && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      )}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5">
        <address
          itemProp="author"
          itemScope
          itemType="https://schema.org/Person"
          className="not-italic flex items-center gap-2"
        >
          <Avatar className="size-8 border border-white/20">
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback className={cn(hasBg && 'bg-black/40 text-white')}>
              <User2 size={16} />
            </AvatarFallback>
          </Avatar>
          <span
            itemProp="name"
            className={cn(
              'font-medium',
              hasBg ? 'text-white' : 'text-foreground',
            )}
          >
            {authorName}
          </span>
        </address>
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={16} aria-hidden="true" />
          <time
            itemProp="datePublished"
            dateTime={new Date(createdAt).toISOString()}
          >
            {formatDateTime(createdAt)}
          </time>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={16} aria-hidden="true" />
          <span>อ่าน {readingTime} นาที</span>
        </div>
      </div>
    </div>
  )
}
