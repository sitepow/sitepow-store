'use client'

import { useStorefrontCategoriesProductsSections } from '@/actions/hooks/storefront/sections'

import { Skeleton } from '@/components/ui/skeleton'

import { CategorySection } from './Category'

export function CategoriesSection({ storeSlug }: { storeSlug: string }) {
  const { data, isLoading } = useStorefrontCategoriesProductsSections(storeSlug)

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!data?.length) {
    return null
  }

  return (
    <>
      {data.map((categoryGroup) => (
        <CategorySection
          key={categoryGroup.id}
          categorySlug={categoryGroup.slug}
          title={categoryGroup.title}
          image={categoryGroup.image}
          products={categoryGroup.products}
        />
      ))}
    </>
  )
}
