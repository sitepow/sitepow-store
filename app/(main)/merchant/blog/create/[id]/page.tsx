import { BlogCreateClient } from '../../_components/BlogCreateClient'

export default async function StoreAdminBlogUpdate({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params

  return <BlogCreateClient blogId={id} />
}
