import { redirect } from 'next/navigation'

interface CategoryPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function StoreCategoryPage({
  searchParams,
}: CategoryPageProps) {
  const resolved = await searchParams
  if (resolved?.category) {
    redirect(`/products?category=${resolved.category}`)
  }
  redirect('/products')
}
