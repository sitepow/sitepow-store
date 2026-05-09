'use client'

import { useState } from 'react'

import { SectionContainer } from '@/components/SectionContainer'
import { MainLayout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <MainLayout>
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
    </MainLayout>
  )
}
