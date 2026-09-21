import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'
import { BlogsList } from './_components/BlogsList'

type Props = {
  params: Promise<{ domain: string }>
}

export default async function StoreBlogsPage({ params }: Props) {
  const { domain } = await params

  return (
    <StoreLayout>
      <SectionContainer>
        <h1 className="text-foreground text-4xl leading-tight font-bold">
          บทความทั้งหมด
        </h1>
        <BlogsList storeSlug={domain} />
      </SectionContainer>
    </StoreLayout>
  )
}
