'use client'

import { useTranslations } from 'next-intl'

import {
  IconAlertTriangle,
  IconClock,
  IconShieldCheck,
  IconTerminal2,
} from '@tabler/icons-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WebhookBestPractices() {
  const t = useTranslations('docs')

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        {t('bestPractices.title')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <IconClock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">
                {t('bestPractices.fast200Title')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
            <p>{t('bestPractices.fast200Desc')}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-base">
                {t('bestPractices.idempotencyTitle')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
            <p>{t('bestPractices.idempotencyDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <IconTerminal2 className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">
                {t('bestPractices.retryTitle')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
            <p>{t('bestPractices.retryDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">
                {t('bestPractices.autoDisableTitle')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
            <p>{t('bestPractices.autoDisableDesc')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
