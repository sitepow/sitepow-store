import { StoreAdminProductNewClient } from './page.client'

export default async function StoreAdminProductUpdate({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params

  return <StoreAdminProductNewClient productId={id} />
}
