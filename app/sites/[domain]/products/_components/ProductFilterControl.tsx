'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { useStorefrontCategoryOptions } from '@/actions/hooks/storefront/category'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductFilterControl({ storeSlug }: { storeSlug: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: categories, isLoading } =
    useStorefrontCategoryOptions(storeSlug)

  const selectedCategory = searchParams.get('category') ?? ''

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const clearAll = () => router.push('?')

  return (
    <aside className="w-full shrink-0 space-y-8 xl:sticky xl:top-40 xl:col-span-3">
      <Accordion
        type="multiple"
        defaultValue={['categories']}
        className="w-full"
      >
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
            หมวดหมู่
          </AccordionTrigger>
          <AccordionContent className="space-y-4 py-10 pt-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                ))
              : categories?.map((cat) => (
                  <div key={cat.slug} className="flex items-center space-x-3">
                    <Checkbox
                      id={`cat-${cat.slug}`}
                      checked={selectedCategory === cat.slug}
                      onCheckedChange={(checked) =>
                        updateParam('category', checked ? cat.slug : null)
                      }
                    />
                    <Label
                      htmlFor={`cat-${cat.slug}`}
                      className="cursor-pointer text-sm font-medium"
                    >
                      {cat.title}
                    </Label>
                  </div>
                ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />
      <Button variant="link" onClick={clearAll}>
        ล้างตัวกรองทั้งหมด
      </Button>
    </aside>
  )
}
