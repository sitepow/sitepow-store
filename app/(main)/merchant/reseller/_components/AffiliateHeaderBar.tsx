'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { IconCoin, IconSettings } from '@tabler/icons-react'

interface AffiliateHeaderBarProps {
  isEnabled: boolean
  commissionRate: number
  isLoading: boolean
  isPending: boolean
  onToggleEnabled: (checked: boolean) => void
  onOpenSettings: () => void
}

export function AffiliateHeaderBar({
  isEnabled,
  commissionRate,
  isLoading,
  isPending,
  onToggleEnabled,
  onOpenSettings,
}: AffiliateHeaderBarProps) {
  const t = useTranslations('merchant.reseller.affiliate')

  return (
    <div className="border-border/80 bg-card flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-xs sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <IconCoin className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-base font-bold">
              {t('status')}
            </h3>
            <Badge
              variant={isEnabled ? 'default' : 'secondary'}
              className="text-xs"
            >
              {isEnabled ? t('active') : t('inactive')}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {isEnabled
              ? t('statusDescActive', { rate: commissionRate })
              : t('statusDescInactive')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-muted/40 flex items-center gap-2 rounded-xl px-3 py-1.5">
          <span className="text-xs font-medium">{t('active')}</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggleEnabled}
            disabled={isLoading || isPending}
          />
        </div>

        <Button
          variant="outline"
          className="gap-1.5 font-bold"
          onClick={onOpenSettings}
        >
          <IconSettings className="size-4" />
          {t('settings')}
        </Button>
      </div>
    </div>
  )
}

