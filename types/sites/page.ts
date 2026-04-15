export interface StorePageProps {
  params: Promise<{
    slug: string
    domain: string
  }>
}
