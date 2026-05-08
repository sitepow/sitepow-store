'use client'

import { useState } from 'react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreContractUsPage() {
  const [formData, setFormData] = useState({
    subject: '',
    orderId: '',
    message: '',
  })

  const orders = [
    { id: 'cl-123', orderNumber: 'ORD-789' },
    { id: 'cl-456', orderNumber: 'ORD-012' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <StoreLayout>
      <SectionContainer>
        <Card className="w-full sm:w-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">ติดต่อสอบถาม</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              <div className="space-y-2">
                <label className="text-sm font-medium">หัวข้อเรื่อง</label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="เช่น สอบถามเรื่องการเปลี่ยนสินค้า"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  อ้างอิงออเดอร์ (ถ้ามี)
                </label>
                <Select
                  onValueChange={(val) =>
                    setFormData({ ...formData, orderId: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกรายการออเดอร์ของคุณ" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">รายละเอียด</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="พิมพ์ข้อความที่ต้องการติดต่อเจ้าหน้าที่..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                ส่งฟอร์มติดต่อ
              </Button>
            </form>
          </CardContent>
        </Card>
      </SectionContainer>
    </StoreLayout>
  )
}
