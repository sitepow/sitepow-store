import { StoreLayout } from './_components/layout/Layout'
// import { BlogsSection } from './_components/section/Blogs'
import { CategoriesSection } from './_components/section/Categories'
import { ProductsSection } from './_components/section/Products'

type Props = {
  params: Promise<{ domain: string }>
}

export default async function StoreHomePage({ params }: Props) {
  const { domain } = await params

  return (
    <StoreLayout>
      {/* <BlogsSection storeSlug={domain} /> */}
      <CategoriesSection storeSlug={domain} />
      <ProductsSection storeSlug={domain} />
    </StoreLayout>
  )
}
