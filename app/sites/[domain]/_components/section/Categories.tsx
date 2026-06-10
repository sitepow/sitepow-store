'use client'

import { useStorefrontCategories } from '@/actions/hooks/storefront/category'

import { CategorySection } from './Category'

export function CategoriesSection({ storeSlug }: { storeSlug: string }) {
  const { data: categories, isLoading } = useStorefrontCategories({ storeSlug })

  if (isLoading || !categories?.length) {
    return null
  }

  return (
    <>
      {categories.map((category) => (
        <CategorySection
          {...category}
          categorySlug={category.slug}
          key={category.id}
          categoryId={category.id}
          storeSlug={storeSlug}
        />
      ))}
    </>
  )
}
