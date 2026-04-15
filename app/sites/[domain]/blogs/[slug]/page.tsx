import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'

export default function StoreBlogDescriptionPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <div className="h-106.25 w-full rounded-xl bg-gray-100" />
        <div className="my-2.5 flex w-full flex-col justify-start text-start">
          <h1 className="text-start text-4xl leading-tight font-bold">
            รีวิวเจาะลึก Logitech MX Master 3S เมาส์ที่ดีที่สุดสำหรับสาย
            Productivity?
          </h1>
        </div>
        <div className="h-106.25 w-full rounded-xl bg-gray-100" />
      </SectionContainer>
    </StoreLayout>
  )
}
