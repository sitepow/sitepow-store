import { ProductCreateClient } from '../_components/ProductCreateClient'

export default async function StoreAdminProductUpdate({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params

  return <ProductCreateClient productId={id} />
}
