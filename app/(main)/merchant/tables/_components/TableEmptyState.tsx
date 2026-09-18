'use client'

import { useTranslations } from 'next-intl'

import { IconArmchair, IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'

interface TableEmptyStateProps {
  onAddTable: () => void
}

export function TableEmptyState({ onAddTable }: TableEmptyStateProps) {
  const t = useTranslations('merchant.tables')

  return (
    <Card className="py-12 text-center">
      <CardContent className="space-y-3">
        <IconArmchair className="text-muted-foreground mx-auto size-12 opacity-50" />
        <CardTitle>{t('emptyTitle')}</CardTitle>
        <CardDescription>{t('emptyDescription')}</CardDescription>
        <Button size="sm" onClick={onAddTable} className="mt-2">
          <IconPlus className="mr-2 size-4" />
          {t('addTable')}
        </Button>
      </CardContent>
    </Card>
  )
}
