'use client'

import { useState } from 'react'

import { MapPinIcon, SaveIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { DashboardHeader } from '../../_components/DashboardHeader'
import { StoreAdminLayout } from '../../_components/layout/admin/Layout'

export default function StoreAdminSettingsPage() {
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    facebook: '',
    lineId: '',
    pointsEarningRate: '',
    pointsRedeemRate: '',
    isPointsEnabled: true,
  })

  const handleChange = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <StoreAdminLayout>
      <div className="container space-y-8 py-10">
        <DashboardHeader
          title="ตั้งค่าร้านค้า"
          description="จัดการข้อมูลและตัวตนของร้านค้าคุณบนแพลตฟอร์ม"
        />

        <form onSubmit={handleSave} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป</CardTitle>
              <CardDescription>
                ระบุชื่อร้านและคำอธิบายที่บ่งบอกความเป็นตัวตนของแบรนด์คุณ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-6">
                <Field>
                  <Label htmlFor="storeName">ชื่อร้านค้า *</Label>
                  <Input
                    id="storeName"
                    placeholder="เช่น Minimalist Style Store, ร้านส้มตำแม่คำฟ้า"
                    value={formData.storeName}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="description">รายละเอียดร้านค้า</Label>
                  <Textarea
                    id="description"
                    placeholder="เล่าเรื่องราวของร้านคุณ หรือจุดเด่นของสินค้า (ความยาว 100-200 ตัวอักษร)"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange('description', e.target.value)
                    }
                    rows={4}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>การติดต่อ</CardTitle>
              <CardDescription>
                ข้อมูลนี้จะใช้สำหรับการส่งอีเมลแจ้งเตือนและการติดต่อจากลูกค้า
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@yourstore.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Field>
                <Field>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08X-XXX-XXXX หรือ 02-XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </Field>
                <Field className="md:col-span-2">
                  <Label htmlFor="address">ที่ตั้งร้านค้า</Label>
                  <div className="relative">
                    <MapPinIcon className="text-muted-foreground absolute top-3 left-3 size-4" />
                    <Textarea
                      id="address"
                      className="pl-9"
                      placeholder="ระบุเลขที่ตั้ง อาคาร ชั้น ถนน แขวง/ตำบล (สำหรับใช้ในใบกำกับภาษีและหน้าติดต่อเรา)"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>โซเชียลมีเดีย & เว็บไซต์</CardTitle>
              <CardDescription>
                เพิ่มช่องทางการติดตามเพื่อให้ลูกค้าเข้าถึงร้านค้าของคุณได้มากขึ้น
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field>
                  <Label htmlFor="website">เว็บไซต์</Label>
                  <Input
                    id="website"
                    placeholder="https://www.yourstore.com"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </Field>
                <Field>
                  <Label htmlFor="facebook">Facebook Page</Label>
                  <Input
                    id="facebook"
                    placeholder="facebook.com/yourstorename"
                    value={formData.facebook}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                  />
                </Field>
                <Field>
                  <Label htmlFor="lineId">Line OA ID</Label>
                  <Input
                    id="lineId"
                    placeholder="เช่น @yourstore (อย่าลืมใส่ @)"
                    value={formData.lineId}
                    onChange={(e) => handleChange('lineId', e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ระบบแต้มสะสม</CardTitle>
              <CardDescription>
                กำหนดอัตราการสะสมแต้มและการแลกรับส่วนลด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field>
                  <Label htmlFor="pointsEarningRate">
                    ยอดซื้อต่อ 1 แต้ม (บาท)
                  </Label>
                  <Input
                    id="pointsEarningRate"
                    type="number"
                    placeholder="เช่น 25 (ซื้อครบ 25 บาท ได้ 1 แต้ม)"
                    value={formData.pointsEarningRate}
                    onChange={(e) =>
                      handleChange('pointsEarningRate', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label htmlFor="pointsRedeemRate">
                    จำนวนแต้มแลกส่วนลด 1 บาท
                  </Label>
                  <Input
                    id="pointsRedeemRate"
                    type="number"
                    placeholder="เช่น 10 (ใช้ 10 แต้ม แลกส่วนลดได้ 1 บาท)"
                    value={formData.pointsRedeemRate}
                    onChange={(e) =>
                      handleChange('pointsRedeemRate', e.target.value)
                    }
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button type="submit" size="lg">
                <SaveIcon className="mr-2 size-4" />
                บันทึกการเปลี่ยนแปลง
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </StoreAdminLayout>
  )
}
