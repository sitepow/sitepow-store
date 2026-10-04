import { SectionContainer } from '@/components/layout/SectionContainer'
import { SectionHeader } from '@/components/layout/SectionHeader'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreCustomerReviewsPage() {
  return (
    <StoreLayout>
      <SectionContainer className="py-12 sm:py-16">
        <SectionHeader
          title="คะแนนและความคิดเห็นจากลูกค้า"
          description="ความประทับใจจากลูกค้าที่สั่งซื้อสินค้าจริงกับทางร้าน"
        />
        <div className="text-muted-foreground mt-8 text-sm">
          สามารถดูรีวิวและคะแนนสินค้าได้ที่หน้ารายละเอียดของสินค้าแต่ละรายการ
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
