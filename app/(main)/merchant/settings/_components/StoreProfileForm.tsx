'use client'

import { useState } from 'react'

import {
  IconBuildingStore,
  IconDeviceFloppy,
  IconFilter,
  IconLoader2,
  IconPhoto,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const MOCK_STORES_SETTINGS = {
  'store-1': {
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    slug: 'sitepow-style',
    email: 'contact@sitepowstyle.com',
    taxId: '0105566000121',
    receiptFooter: 'ขอบคุณที่ใช้บริการค๊า ซื้อแล้วไม่รับเปลี่ยนคืนน้า',
  },
  'store-2': {
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    slug: 'homkrun-cafe',
    email: 'coffee@homkrun.com',
    taxId: '',
    receiptFooter: 'กลิ่นหอมกรุ่นทุกแก้ว ขอให้เป็นวันที่ดีของคุณครับ',
  },
  'store-3': {
    name: 'Gadget & IT Accessories',
    slug: 'sitepow-gadget',
    email: 'support@spgadget.com',
    taxId: '0109999888777',
    receiptFooter:
      'สินค้าไอทีรับประกัน 1 ปีเต็ม กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน',
  },
}

export function StoreProfileForm() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [storeConfigs, setStoreConfigs] = useState(MOCK_STORES_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  const currentStoreConfig =
    storeConfigs[selectedStoreId as keyof typeof storeConfigs]

  const handleFieldChange = (field: string, value: string) => {
    setStoreConfigs((prev) => ({
      ...prev,
      [selectedStoreId]: {
        ...prev[selectedStoreId as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconBuildingStore}
          title="ข้อมูลโปรไฟล์แบรนด์และร้านค้าหลัก"
          description="แก้ไขข้อมูลสาขาหลัก, URL Slug หน้าระบบ และข้อมูลข้อความหมายเหตุที่จะปรากฏในกระดาษใบเสร็จ POS"
          endContent={
            <Field>
              <FieldLabel>
                <IconFilter size={14} />
                กรองตามร้านค้า
              </FieldLabel>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="เลือกแบรนด์ที่ต้องการตั้งค่า" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(storeConfigs).map(([id, store]) => (
                    <SelectItem key={id} value={id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          }
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <FieldLabel className="text-sm font-medium tracking-tight text-neutral-900">
            โลโก้ประจำแบรนด์ร้านค้า (Store Logo)
          </FieldLabel>
          <div className="flex items-center gap-5">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-xl border border-dashed">
              <IconPhoto size={24} stroke={1.5} />
            </div>
            <div className="space-y-2 pt-1">
              <Button variant="outline" type="button">
                อัปโหลดรูปภาพใหม่
              </Button>
              <FieldDescription className="max-w-xs text-xs leading-normal text-neutral-500">
                แนะนำไฟล์สี่เหลี่ยมจัตุรัส PNG หรือ JPG ขนาดไม่เกิน 2MB
              </FieldDescription>
            </div>
          </div>
        </Field>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Field>
            <FieldLabel>ชื่อร้านค้า / ชื่อจดทะเบียนพาณิชย์</FieldLabel>
            <Input
              id="st-name"
              placeholder="ระบุชื่อเต็มของร้านค้า"
              value={currentStoreConfig?.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Store URL Slug (ลิงก์หลักระบบ Sale Page)</FieldLabel>
            <div className="flex items-center overflow-hidden rounded-md shadow-sm">
              <span className="border-input bg-muted text-muted-foreground flex h-9 items-center border border-r-0 px-3 text-sm select-none">
                sitepow.store/
              </span>
              <Input
                id="st-slug"
                className="rounded-l-none"
                placeholder="my-shop-slug"
                value={currentStoreConfig?.slug || ''}
                onChange={(e) => handleFieldChange('slug', e.target.value)}
              />
            </div>
          </Field>
          <Field>
            <FieldLabel>
              อีเมลติดต่อและส่งใบแจ้งหนี้หลัก (Store Email)
            </FieldLabel>
            <Input
              id="st-email"
              type="email"
              placeholder="example@store.com"
              value={currentStoreConfig?.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>เลขประจำตัวผู้เสียภาษี 13 หลัก (Tax ID)</FieldLabel>
            <Input
              id="st-tax"
              maxLength={13}
              className="font-mono"
              placeholder="เลขประจำตัวผู้เสียภาษีสำหรับระบุบนใบเสร็จเต็มรูปแบบ"
              value={currentStoreConfig?.taxId || ''}
              onChange={(e) => handleFieldChange('taxId', e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>
              ข้อความสโลแกนหรือเงื่อนไขท้ายใบเสร็จ (Receipt Footer Note)
            </FieldLabel>
            <Textarea
              id="st-footer"
              rows={2}
              placeholder="เช่น ขอบคุณที่เลือกอุดหนุนสินค้า หากพบปัญหาสามารถติดต่อเคลมภายใน 7 วัน"
              value={currentStoreConfig?.receiptFooter || ''}
              onChange={(e) =>
                handleFieldChange('receiptFooter', e.target.value)
              }
            />
          </Field>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t">
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />{' '}
              กำลังบันทึกข้อมูล...
            </>
          ) : (
            <>
              <IconDeviceFloppy size={14} /> บันทึกการตั้งค่าร้านค้า
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
