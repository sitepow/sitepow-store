'use client'

import { useTranslations } from 'next-intl'
import { IconBuildingStore, IconCoin } from '@tabler/icons-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ResellerTabNavigationProps {
  tab: 'consignment' | 'affiliate'
  onTabChange: (val: 'consignment' | 'affiliate') => void
}

export function ResellerTabNavigation({
  tab,
  onTabChange,
}: ResellerTabNavigationProps) {
  const t = useTranslations('merchant.reseller')

  return (
    <div className="mb-4">
      <Tabs
        value={tab}
        onValueChange={(val) => onTabChange(val as 'consignment' | 'affiliate')}
        className="w-full"
      >
        <TabsList className="bg-muted/70 grid w-full max-w-md grid-cols-2">
          <TabsTrigger
            value="consignment"
            className="gap-2 text-xs font-bold sm:text-sm"
          >
            <IconBuildingStore className="size-4" />
            {t('tabs.consignment')}
          </TabsTrigger>
          <TabsTrigger
            value="affiliate"
            className="gap-2 text-xs font-bold sm:text-sm"
          >
            <IconCoin className="size-4" />
            {t('tabs.affiliate')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

