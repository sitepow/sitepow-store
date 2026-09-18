'use client'

import { useTranslations } from 'next-intl'

import { IconToolsKitchen2 } from '@tabler/icons-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'

export function KitchenEmptyState() {
  const t = useTranslations('merchant.kitchen')

  return (
    <Card className="py-16 text-center">
      <CardContent className="space-y-3">
        <IconToolsKitchen2 className="text-muted-foreground mx-auto size-16 opacity-40" />
        <CardTitle className="text-xl">{t('emptyTitle')}</CardTitle>
        <CardDescription className="mx-auto max-w-md">
          {t('emptyDescription')}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
