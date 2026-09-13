'use client'

import { useStorefrontCategoriesProductsSections } from '@/actions/hooks/storefront/sections'

import { CategorySection } from './Category'

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
          translations={categoryGroup.translations}
          products={categoryGroup.products}
          isLoading={isLoading}
        />
      ))}
    </>
  )
}
