'use client'

import { useTranslations } from 'next-intl'

import { SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'

export function StoreSearchInput() {
  const t = useTranslations('storefront.navbar')

  return (
    <ButtonGroup className="w-full">
      <Input
        id="input-button-group"
        className="bg-white dark:bg-neutral-800"
        placeholder={t('searchPlaceholder')}
      />
      <Button variant="secondary">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  )
}
