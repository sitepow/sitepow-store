'use client'

import { useState } from 'react'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconHeart, IconSearch } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Input } from '@/components/ui/input'

import { WishlistTable } from './_components/WishlistTable'

const MOCK_WISHLIST = [
  {
    id: 'prod-001',
    name: 'เสื้อเชิ้ตโอเวอร์ไซส์ มินิมอล สไตล์เกาหลี',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    price: 390,
    discountPrice: 290,
    imageUrl:
      'https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=400&h=400&auto=format&fit=crop',
    inStock: true,
  },
  {
    id: 'prod-002',
    name: 'เคสหนังแท้ iPhone 15 Pro Max',
    storeName: 'Gadget & IT Accessories',
    price: 850,
    discountPrice: null,
    imageUrl:
      'https://images.unsplash.com/photo-1695653422718-97d25c1f9761?q=80&w=400&h=400&auto=format&fit=crop',
    inStock: true,
  },
  {
    id: 'prod-003',
    name: 'กางเกงสแล็คขาเต่อ ทรงกระบอกเล็ก',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    price: 450,
    discountPrice: 350,
    imageUrl:
      'https://images.unsplash.com/photo-1624371414361-e6e0ea562a26?q=80&w=400&h=400&auto=format&fit=crop',
    inStock: false,
  },
]

export default function StoreUserWishlistPage() {
  const [items, setItems] = useState(MOCK_WISHLIST)
  const [searchTerm, setSearchTerm] = useState('')

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardSidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconHeart}
        title="สินค้าที่ถูกใจ"
        description="รายการสินค้าที่คุณชื่นชอบและบันทึกไว้ เช็คสถานะสินค้าและกดลงตะกร้าได้ทันที"
        endContent={
          <div className="relative w-full sm:w-64">
            <IconSearch
              className="text-muted-foreground absolute top-2.5 left-3"
              size={16}
            />
            <Input
              placeholder="ค้นหาในรายการโปรด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        }
      />
      <WishlistTable items={filteredItems} onRemove={handleRemove} />
    </DashboardSidebar>
  )
}
