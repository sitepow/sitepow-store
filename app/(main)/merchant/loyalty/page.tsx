'use client'

import { useState } from 'react'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'
import { IconCoin, IconFilter } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { CustomerPointsTable } from './_components/CustomerPointsTable'
import { LoyaltySettingsCard } from './_components/LoyaltySettingsCard'

const MOCK_LOYALTY_SETTINGS = {
  'store-1': {
    isEnabled: true,
    earnRate: 100,
    rewardValue: 1,
    minRedeemPoints: 10,
  },
  'store-2': {
    isEnabled: false,
    earnRate: 50,
    rewardValue: 1,
    minRedeemPoints: 20,
  },
  'store-3': {
    isEnabled: true,
    earnRate: 20,
    rewardValue: 1,
    minRedeemPoints: 50,
  },
}

const MOCK_CUSTOMER_POINTS = {
  'store-1': [
    {
      id: 'CUST-01',
      name: 'คุณสมชาย ใจดี',
      phone: '081-234-5678',
      currentPoints: 150,
      totalEarned: 450,
      lastActive: '2026-05-16',
    },
    {
      id: 'CUST-02',
      name: 'คุณวรรณา รักเรียน',
      phone: '089-876-5432',
      currentPoints: 45,
      totalEarned: 120,
      lastActive: '2026-05-15',
    },
    {
      id: 'CUST-03',
      name: 'คุณจอนห์น โด',
      phone: '095-111-2222',
      currentPoints: 8,
      totalEarned: 580,
      lastActive: '2026-05-10',
    },
  ],
  'store-2': [],
  'store-3': [
    {
      id: 'CUST-04',
      name: 'คุณสมศักดิ์ สายไอที',
      phone: '082-999-8888',
      currentPoints: 1250,
      totalEarned: 3500,
      lastActive: '2026-05-17',
    },
  ],
}

export default function MerchantLoyaltyPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [searchTerm, setSearchTerm] = useState('')
  const [settings, setSettings] = useState(MOCK_LOYALTY_SETTINGS)

  const currentStoreSettings =
    settings[selectedStoreId as keyof typeof settings]
  const currentStoreCustomers =
    MOCK_CUSTOMER_POINTS[
      selectedStoreId as keyof typeof MOCK_CUSTOMER_POINTS
    ] || []

  const handleToggleLoyalty = (checked: boolean) => {
    setSettings({
      ...settings,
      [selectedStoreId]: { ...currentStoreSettings, isEnabled: checked },
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setSettings({
      ...settings,
      [selectedStoreId]: { ...currentStoreSettings, [field]: value },
    })
  }
  const filteredCustomers = currentStoreCustomers.filter(
    (customer) =>
      customer.name.includes(searchTerm) || customer.phone.includes(searchTerm),
  )

  return (
    <MerchantLayout>
      <PageTabHeader
        icon={IconCoin}
        title="ระบบแต้มสะสม"
        description="ตั้งค่าเงื่อนไขการแจกแต้ม และบริหารจัดการคะแนนสมาชิกของแต่ละร้านค้า"
        endContent={
          <Field>
            <FieldLabel className="flex items-center gap-1.5">
              <IconFilter size={14} />
              กรองตามร้านค้า
            </FieldLabel>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-full md:w-70">
                <SelectValue placeholder="เลือกร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store-1">
                  เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                </SelectItem>
                <SelectItem value="store-2">
                  ร้านกาแฟหอมกรุ่น Cafe & Bakery
                </SelectItem>
                <SelectItem value="store-3">Gadget & IT Accessories</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
        <LoyaltySettingsCard
          settings={currentStoreSettings}
          onToggleLoyalty={handleToggleLoyalty}
          onInputChange={handleInputChange}
          className="xl:col-span-4"
        />
        <CustomerPointsTable
          customers={filteredCustomers}
          isEnabled={currentStoreSettings?.isEnabled}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          className="xl:col-span-8"
        />
      </div>
    </MerchantLayout>
  )
}
