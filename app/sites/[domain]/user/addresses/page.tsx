'use client'

import { BUYER_NAVIGATION } from '@/constants/store/navigation'
import { IconMapPin } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { CustomerAddressCreateDialog } from '../../cart/_components/CustomerAddressCreateDialog'
import { AddressTable } from './_components/AddressTable'

export default function StoreUserAddressesPage() {
  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconMapPin}
        title="ที่อยู่จัดส่ง"
        description="บันทึกสมุดที่อยู่รับสินค้า เพื่อความสะดวกและรวดเร็วในการกรอกฟอร์มปลายทางตอนสั่งซื้อผ่านหน้า Sale Page"
        endContent={<CustomerAddressCreateDialog />}
      />
      <AddressTable />
    </Sidebar>
  )
}
