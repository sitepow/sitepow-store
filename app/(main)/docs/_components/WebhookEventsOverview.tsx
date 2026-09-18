'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WebhookEventsOverview() {
  const t = useTranslations('docs')

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{t('events.title')}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-primary text-[11px]">
                order.created
              </Badge>
            </div>
            <CardTitle className="mt-2 text-base">
              {t('events.createdTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs leading-relaxed">
            {t('events.createdDesc')}
          </CardContent>
        </Card>

        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="text-[11px]">order.paid</Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600"
              >
                {t('events.recommendedBadge')}
              </Badge>
            </div>
            <CardTitle className="mt-2 text-base">
              {t('events.paidTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs leading-relaxed">
            {t('events.paidDesc')}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-destructive text-[11px]">
                order.cancelled
              </Badge>
            </div>
            <CardTitle className="mt-2 text-base">
              {t('events.cancelledTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs leading-relaxed">
            {t('events.cancelledDesc')}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
