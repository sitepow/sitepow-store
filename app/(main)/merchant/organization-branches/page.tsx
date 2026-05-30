'use client'

import { useMemo, useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconHierarchy } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { BranchListTable } from './_components/BranchListTable'

export interface Branch {
  id: string
  storeId: string
  name: string
  taxId: string | null
  phone: string | null
  address: string | null
  isActive: boolean
  staffCount: number
  totalStockItems: number
}

const MOCK_BRANCHES_DATA: Branch[] = [
  {
    id: 'br-1',
    storeId: 'store-1',
    name: 'สาขาสยามสแควร์ (HQ)',
    taxId: '0105566000121',
    phone: '02-111-2222',
    address:
      '999 อาคารสยามพารากอน ชั้น 3 ถนนพระรามที่ 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    isActive: true,
    staffCount: 8,
    totalStockItems: 1420,
  },
  {
    id: 'br-2',
    storeId: 'store-1',
    name: 'สาขาอารีย์',
    taxId: '0105566000121',
    phone: '02-333-4444',
    address:
      '11/1 โครงการเดอะพรีเซ้นต์ ซอยอารีย์ 1 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพมหานคร 10400',
    isActive: true,
    staffCount: 3,
    totalStockItems: 450,
  },
  {
    id: 'br-3',
    storeId: 'store-3',
    name: 'สาขาเซ็นทรัลเวิลด์',
    taxId: '0109999888777',
    phone: '02-555-6666',
    address:
      '4/4 ศูนย์การค้าเซ็นทรัลเวิลด์ ชั้น 4 ถนนราชดำริ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    isActive: true,
    staffCount: 12,
    totalStockItems: 3800,
  },
]

export default function MerchantOrganizationBranchesPage() {
  const { selectedStoreId } = useStoreFilter()
  const [branches] = useState<Branch[]>(MOCK_BRANCHES_DATA)

  const filteredBranches = useMemo(() => {
    if (!branches) {
      return []
    }

    return branches.filter((branch) => branch.storeId === selectedStoreId)
  }, [branches, selectedStoreId])

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHierarchy}
        title="การจัดการสาขา"
        description="บริหารจัดการที่ตั้งสาขาและคลังหน้าร้าน เพื่อใช้ควบคุมสิทธิ์พนักงานและกระจายสต็อกสินค้าคงคลังให้แม่นยำ"
        endContent={<StoreSelectField />}
      />
      <BranchListTable branches={filteredBranches} />
    </DashboardSidebar>
  )
}
