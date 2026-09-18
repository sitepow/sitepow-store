'use client'

import { useTranslations } from 'next-intl'
import { IconLayoutBottombar } from '@tabler/icons-react'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PageItemConfig } from '../_hooks/use-store-pages-form'

interface StorePagesSidebarProps {
  pages: PageItemConfig[]
}

export function StorePagesSidebar({ pages }: StorePagesSidebarProps) {
  const t = useTranslations('merchant.storePages')

  return (
    <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 overflow-x-auto rounded-xl border p-1 xl:sticky xl:top-5 xl:w-64 xl:flex-col">
      {pages.map((page) => {
        const Icon = page.icon
        return (
          <TabsTrigger
            key={page.id}
            value={page.id}
            className="shrink-0 cursor-pointer gap-2 py-2 xl:shrink"
          >
            <Icon size={16} className="shrink-0" />
            <span className="truncate">{page.label}</span>
          </TabsTrigger>
        )
      })}
      <TabsTrigger
        value="footer"
        className="shrink-0 cursor-pointer gap-2 py-2 xl:shrink"
      >
        <IconLayoutBottombar size={16} className="shrink-0" />
        <span className="truncate">{t('footer.tabLabel')}</span>
      </TabsTrigger>
    </TabsList>
  )
}
