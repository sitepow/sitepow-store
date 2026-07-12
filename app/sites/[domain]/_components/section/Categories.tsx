'use client'

// import { useState } from 'react'
// import { handleUserPrompt } from '@/actions/ai'
import { useStorefrontCategoriesProductsSections } from '@/actions/hooks/storefront/sections'

// import { Plan } from '@/generated/prisma/enums'
// import { useStoreData } from '@/stores/sites/use-store-data'

// import { Button } from '@/components/ui/button'

import { CategorySection } from './Category'

export function CategoriesSection({ storeSlug }: { storeSlug: string }) {
  const { data, isLoading } = useStorefrontCategoriesProductsSections(storeSlug)
  // const { store } = useStoreData()
  // const [costInfo, setCostInfo] = useState<{
  //   credits: number
  //   baht: number
  // } | null>(null)
  // const [isCalculating, setIsCalculating] = useState(false)

  // const handleCalculate = async () => {
  //   setIsCalculating(true)

  //   const result = await handleUserPrompt(
  //     'ตั้งค่าร้านค้ายังไงครับ',
  //     store?.plan || Plan.FREE,
  //   )

  //   setCostInfo(result)
  //   setIsCalculating(false)
  // }

  if (!data?.length) {
    // return (
    //   <div className="flex w-full flex-col items-center justify-center">
    //     <Button
    //       className="mx-auto mt-20"
    //       onClick={handleCalculate}
    //       disabled={isCalculating}
    //     >
    //       {isCalculating
    //         ? 'กำลังคำนวณ...'
    //         : costInfo
    //           ? `ใช้ประมาน ${costInfo.baht} บาท (หรือ ${costInfo.credits} เครดิต)`
    //           : 'คำนวณเครดิต AI ที่ต้องจ่าย'}
    //     </Button>
    //   </div>
    // )

    return null
  }

  return (
    <>
      {data.map((categoryGroup) => (
        <CategorySection
          key={categoryGroup.id}
          categorySlug={categoryGroup.slug}
          title={categoryGroup.title}
          image={categoryGroup.image}
          products={categoryGroup.products}
          isLoading={isLoading}
        />
      ))}
    </>
  )
}
