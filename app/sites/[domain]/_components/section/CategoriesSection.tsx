'use client'

import { useStorefrontCategoriesProductsSections } from '@/actions/storefront/sections/hooks'

import { CategorySection } from './CategorySection'

export function CategoriesSection({ storeSlug }: { storeSlug: string }) {
  const { data, isLoading } = useStorefrontCategoriesProductsSections(storeSlug)

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
          isLoading={isLoading}
        />
      ))}
    </>
  )
}
