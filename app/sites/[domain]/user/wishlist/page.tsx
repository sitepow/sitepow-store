'use client'

import { useState } from 'react'

import {
  IconBuildingStore,
  IconCircleCheck,
  IconCircleX,
  IconHeart,
  IconSearch,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { BuyerLayout } from '@/components/layout/BuyerLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
    <BuyerLayout>
      <PageTabHeader
        icon={IconHeart}
        title="สินค้าที่ถูกใจ (My Wishlist)"
        description="รายการสินค้าที่คุณชื่นชอบและบันทึกไว้
            เช็คสถานะสินค้าและกดลงตะกร้าได้ทันที"
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
      {filteredItems.length === 0 ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed py-20 text-center text-xs">
          ไม่พบสินค้าในรายการโปรดของคุณ
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="bg-muted relative aspect-square overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                  {!product.inStock && (
                    <Badge
                      variant="destructive"
                      className="text-[9px] uppercase"
                    >
                      สินค้าหมด
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                >
                  <IconTrash size={16} />
                </button>
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                  <IconBuildingStore size={12} />
                  <span className="truncate">{product.storeName}</span>
                </div>
                <h3 className="text-foreground line-clamp-2 min-h-8 text-xs font-bold">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-primary text-sm font-black">
                    ฿{(product.discountPrice || product.price).toLocaleString()}
                  </span>
                  {product.discountPrice && (
                    <span className="text-muted-foreground text-[10px] line-through">
                      ฿{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {product.inStock ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                      <IconCircleCheck size={12} /> มีสินค้าพร้อมส่ง
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-red-400">
                      <IconCircleX size={12} /> สินค้าหมดชั่วคราว
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/5 border-t p-3 pt-0">
                <Button
                  className="h-8 w-full gap-1.5 text-[11px]"
                  disabled={!product.inStock}
                  variant={product.inStock ? 'default' : 'secondary'}
                >
                  <IconShoppingCart size={14} />
                  หยิบลงตะกร้า
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </BuyerLayout>
  )
}
