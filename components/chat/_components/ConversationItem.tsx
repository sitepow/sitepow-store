import { useLocale, useTranslations } from 'next-intl'

import { IconSparkles } from '@tabler/icons-react'
import { User2 } from 'lucide-react'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import { cn } from '@/lib/utils'

export interface ConversationItemData {
  id: string
  merchantName?: string
  name?: string
  lastMessage: string | null
  lastMessageAt?: Date | string
  isAiEnabled?: boolean
  unreadCount: number
  storeName?: string | null
  customerImage?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  storeLogo?: string | null
  type?: string
  customerRole?: string | null
}

interface ConversationItemProps {
  conv: ConversationItemData
  isSelected?: boolean
  onClick: () => void
}

function formatChatTime(
  dateInput: Date | string | null | undefined,
  t: (key: any, options?: any) => string,
  locale: string,
) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return t('justNow')
  if (diffMinutes < 60)
    return locale === 'th' ? `${diffMinutes} น.` : `${diffMinutes}m`
  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return t('yesterday')
  if (diffDays < 7) return t('daysAgo', { days: diffDays })
  return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

export function ConversationItem({
  conv,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const t = useTranslations('merchant.chat')
  const locale = useLocale()
  const displayName = conv.merchantName || conv.name || t('defaultCustomerName')
  const image = conv.customerImage || conv.storeLogo
  const timeText = formatChatTime(conv.lastMessageAt, t, locale)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-3 border-b p-3 text-left transition-all',
        isSelected
          ? 'bg-primary/10 border-l-primary border-l-3'
          : 'hover:bg-muted/50 border-border/40',
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-10 border shadow-xs">
          {image && <AvatarImage src={image} alt={displayName} />}
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
            {displayName.slice(0, 2).toUpperCase() || <User2 size={16} />}
          </AvatarFallback>
          {conv.isAiEnabled && (
            <AvatarBadge className="border-background size-4 border-2 bg-purple-600 text-white">
              <IconSparkles className="size-2.5" />
            </AvatarBadge>
          )}
        </Avatar>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={cn(
                'truncate text-sm font-medium',
                conv.unreadCount > 0
                  ? 'text-foreground font-semibold'
                  : 'text-foreground/80',
              )}
            >
              {displayName}
            </span>
            {conv.storeName && (
              <span className="bg-muted text-muted-foreground py-0.2 shrink-0 rounded px-1.5 text-[10px]">
                {conv.storeName}
              </span>
            )}
          </div>
          {timeText && (
            <span
              className={cn(
                'shrink-0 text-[11px]',
                conv.unreadCount > 0
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground/70',
              )}
            >
              {timeText}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'line-clamp-1 text-xs leading-normal',
              conv.unreadCount > 0
                ? 'text-foreground font-medium'
                : 'text-muted-foreground',
            )}
          >
            {conv.lastMessage ?? t('noMessages')}
          </p>

          {conv.unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-xs">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
