'use client'

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

interface CategoryDropdownProps {
  storeSlug?: string
}

export function CategoryDropdown({ storeSlug }: CategoryDropdownProps) {
  const { data: categories, isLoading } = useStorefrontCategoryOptions(
    storeSlug!,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-lg font-bold opacity-60 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 data-open:bg-neutral-900/50 data-open:hover:bg-neutral-900 data-open:focus:bg-neutral-900 data-popup-open:bg-neutral-900/50 data-popup-open:hover:bg-neutral-900 lg:text-white"
        >
          <span>หมวดหมู่สินค้า</span>
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {isLoading ? (
          <DropdownMenuItem disabled>กำลังโหลด...</DropdownMenuItem>
        ) : (
          categories?.map((cat) => (
            <DropdownMenuItem key={cat.id} asChild>
              <Link href={`/products?category=${cat.slug}`}>{cat.title}</Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
