'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { IconArrowRight, IconKey, IconWebhook } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function WebhookHeroBanner() {
  const t = useTranslations('docs')

  return (
    <div className="space-y-4 text-center sm:text-left">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Badge
          variant="outline"
          className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
        >
          <IconWebhook className="text-primary h-3.5 w-3.5" />
          {t('badge.apiDocs')}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {t('badge.version')}
        </Badge>
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400"
        >
          {t('badge.security')}
        </Badge>
      </div>

      <h1 className="font-landing text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
        {t('hero.title')}
      </h1>
      <p className="text-muted-foreground max-w-3xl text-base sm:text-lg">
        {t('hero.description')}
      </p>

      <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
        <Link href="/merchant/settings?tab=webhook">
          <Button className="gap-2 font-medium">
            <IconKey size={16} />
            {t('hero.manageEndpoints')}
            <IconArrowRight size={14} />
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" className="font-medium">
            {t('hero.contactSupport')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
