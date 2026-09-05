'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useStorefrontCategoryOptions } from '@/actions/hooks/storefront/category'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

interface CategoryDropdownProps {
  storeSlug?: string
  className?: string
  onItemClick?: () => void
}

export function CategoryDropdown({
  storeSlug,
  className,
  onItemClick,
}: CategoryDropdownProps) {
  const t = useTranslations('storefront.navbar')
  const tCommon = useTranslations('common.actions')
  const { data: categories, isLoading } = useStorefrontCategoryOptions(
    storeSlug!,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'text-lg font-bold opacity-60 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 data-open:bg-neutral-900/50 data-open:hover:bg-neutral-900 data-open:focus:bg-neutral-900 data-popup-open:bg-neutral-900/50 data-popup-open:hover:bg-neutral-900 lg:text-white',
            className,
          )}
        >
          <span>{t('productCategories')}</span>
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {isLoading ? (
          <DropdownMenuItem disabled>{tCommon('loading')}</DropdownMenuItem>
        ) : (
          categories?.map((cat) => (
            <DropdownMenuItem key={cat.id} asChild>
              <Link
                href={`/products?category=${cat.slug}`}
                onClick={onItemClick}
              >
                {cat.title}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
