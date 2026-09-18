'use client'

import { useTranslations } from 'next-intl'

import type { TableMenuCategory } from '@/types/restaurant'
import { IconSearch } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TableMenuCategoryFilterProps {
  categories: TableMenuCategory[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function TableMenuCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: TableMenuCategoryFilterProps) {
  const t = useTranslations('storefront.tableOrder')

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
          onClick={() => onSelectCategory('ALL')}
          className="rounded-full text-xs"
        >
          {t('allCategories')}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => onSelectCategory(cat.id)}
            className="flex-shrink-0 rounded-full text-xs"
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
