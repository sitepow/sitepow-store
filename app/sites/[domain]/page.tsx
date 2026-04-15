import { CATEGORIES } from '@/constants/sites/category'

import { StoreLayout } from './_components/layout/Layout'
import { BlogsSection } from './_components/section/Blogs'
import { CategorySection } from './_components/section/Category'
import { ProductsSection } from './_components/section/Products'

export default function StoreHomePage() {
  return (
    <StoreLayout>
      <BlogsSection />
      {CATEGORIES.map((category) => {
        return <CategorySection key={category.title} {...category} />
      })}
      <ProductsSection />
    </StoreLayout>
  )
}
