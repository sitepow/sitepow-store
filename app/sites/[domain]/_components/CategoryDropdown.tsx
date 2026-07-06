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
        <Button variant="outline">
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
