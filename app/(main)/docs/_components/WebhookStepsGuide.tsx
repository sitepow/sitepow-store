'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WebhookStepsGuide() {
  const t = useTranslations('docs')

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
              1
            </div>
            <CardTitle className="text-base">
              {t('steps.step1Title')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs leading-relaxed">
          {t('steps.step1Desc')}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
              2
            </div>
            <CardTitle className="text-base">
              {t('steps.step2Title')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs leading-relaxed">
          {t.rich('steps.step2Desc', {
            header: () => (
              <code className="text-foreground bg-muted rounded px-1">
                X-Sitepow-Signature
              </code>
            ),
          })}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
              3
            </div>
            <CardTitle className="text-base">
              {t('steps.step3Title')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground text-xs leading-relaxed">
          {t('steps.step3Desc')}
        </CardContent>
      </Card>
    </div>
  )
}
