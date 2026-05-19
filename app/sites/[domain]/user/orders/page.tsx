'use client'

import { useState } from 'react'

import { IconSearch, IconShoppingBag } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { BuyerLayout } from '@/components/layout/BuyerLayout'
import { Input } from '@/components/ui/input'

import { OrderTable } from './_components/OrderTable'

export interface OrderItem {
  name: string
  qty: number
  price: number
}

export interface BuyerOrder {
  id: string
  storeName: string
  itemsSummary: string
  totalAmount: number
  paymentMethod: 'PROMPTPAY' | 'CASH' | string
  status: 'COMPLETED' | 'PENDING_VERIFY' | 'PROCESSING' | string
  trackingNo: string | null
  createdAt: string
  items: OrderItem[]
}

const MOCK_BUYER_ORDERS: BuyerOrder[] = [
  {
    id: 'ORD-9942',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    itemsSummary: 'เสื้อเชิ้ตโอเวอร์ไซส์ มินิมอล x 1, กางเกงสแล็ค x 1',
    totalAmount: 490,
    paymentMethod: 'PROMPTPAY',
    status: 'COMPLETED',
    trackingNo: 'TH123456789EX',
    createdAt: '2026-05-17 10:14',
    items: [
      { name: 'เสื้อเชิ้ตโอเวอร์ไซส์ มินิมอล', qty: 1, price: 290 },
      { name: 'กางเกงสแล็คสไตล์เกาหลี', qty: 1, price: 200 },
    ],
  },
  {
    id: 'ORD-9811',
    storeName: 'Gadget & IT Accessories',
    itemsSummary: 'เคสหนังแท้ iPhone 15 x 1',
    totalAmount: 850,
    paymentMethod: 'PROMPTPAY',
    status: 'PENDING_VERIFY',
    trackingNo: null,
    createdAt: '2026-05-16 18:22',
    items: [{ name: 'เคสหนังแท้ iPhone 15', qty: 1, price: 850 }],
  },
  {
    id: 'ORD-9530',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    itemsSummary: 'หมวกบักเก็ตผ้าฝ้าย x 1',
    totalAmount: 150,
    paymentMethod: 'CASH',
    status: 'PROCESSING',
    trackingNo: 'KEX99887711',
    createdAt: '2026-05-12 14:05',
    items: [{ name: 'หมวกบักเก็ตผ้าฝ้าย', qty: 1, price: 150 }],
  },
]

export default function StoreUserOrderPage() {
  const [orders] = useState<BuyerOrder[]>(MOCK_BUYER_ORDERS)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <BuyerLayout>
      <PageTabHeader
        icon={IconShoppingBag}
        title="ประวัติการสั่งซื้อของคุณ"
        description="ติดตามสถานะคำสั่งซื้อ ตรวจสอบเลขพัสดุ และดูประวัติการช้อปปิ้งย้อนหลัง"
        endContent={
          <div className="relative max-w-md">
            <IconSearch
              className="text-muted-foreground absolute top-2.5 left-3"
              size={16}
            />
            <Input
              placeholder="ค้นหาด้วยรหัสคำสั่งซื้อ หรือชื่อร้านค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        }
      />
      <OrderTable orders={filteredOrders} />
    </BuyerLayout>
  )
}
