'use client'

import { useMemo, useState } from 'react'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'
import { IconFilter, IconHierarchy } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { BranchListTable } from './_components/BranchListTable'
import { CreateBranchDialog } from './_components/CreateBranchDialog'

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
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES_DATA)

  const filteredBranches = useMemo(() => {
    if (!branches) {
      return []
    }

    return branches.filter((branch) => branch.storeId === selectedStoreId)
  }, [branches, selectedStoreId])

  const handleBranchCreated = (newBranch: Branch) => {
    setBranches((prev) => [...prev, newBranch])
  }

  return (
    <MerchantLayout>
      <PageTabHeader
        icon={IconHierarchy}
        title="การจัดการสาขา"
        description="บริหารจัดการที่ตั้งสาขาและคลังหน้าร้าน เพื่อใช้ควบคุมสิทธิ์พนักงานและกระจายสต็อกสินค้าคงคลังให้แม่นยำ"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <Field className="w-fit">
              <FieldLabel className="flex items-center gap-1.5">
                <IconFilter size={14} />
                กรองตามร้านค้า
              </FieldLabel>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="เลือกร้านค้าเพื่อดูสาขา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store-1">
                    เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                  </SelectItem>
                  <SelectItem value="store-2">
                    ร้านกาแฟหอมกรุ่น Cafe & Bakery
                  </SelectItem>
                  <SelectItem value="store-3">
                    Gadget & IT Accessories
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <CreateBranchDialog
              selectedStoreId={selectedStoreId}
              onBranchCreated={handleBranchCreated}
            />
          </div>
        }
      />
      <BranchListTable branches={filteredBranches} />
    </MerchantLayout>
  )
}
