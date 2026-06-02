'use client'

import { useState } from 'react'

import {
  IconDeviceFloppy,
  IconLoader2,
  IconReceiptTax,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export function TaxSettingsForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [isVatRegistered, setIsVatRegistered] = useState(true)
  const [vatRate, setVatRate] = useState('7.0')

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
          icon={IconReceiptTax}
          title="ระบบภาษีมูลค่าเพิ่มและใบกำกับภาษี"
          description="ตั้งค่าการคำนวณภาษีของร้านค้าเพื่อเปิดตัวเลือกให้ลูกค้าขอใบกำกับภาษีเต็มรูปแบบในขั้นตอนเช็คเอาท์ออเดอร์"
        />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/10 flex items-center justify-between rounded-xl border border-dashed p-4">
          <div className="pr-4">
            <span className="block text-sm font-medium">
              เปิดใช้งานระบบภาษีมูลค่าเพิ่ม (VAT Registration Status)
            </span>
            <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
              เปิดเมื่อร้านค้าของคุณจดทะเบียนภาษีมูลค่าเพิ่มแล้ว
              ระบบจะทำการเก็บข้อมูลเลขผู้เสียภาษี 13 หลัก
              และรหัสสาขาของลูกค้าตอนสั่งซื้อสินค้า
            </span>
          </div>
          <Switch
            checked={isVatRegistered}
            onCheckedChange={setIsVatRegistered}
          />
        </div>

        {isVatRegistered && (
          <div className="animate-in fade-in grid grid-cols-1 gap-5 duration-200 sm:grid-cols-2">
            <Field>
              <FieldLabel>
                อัตราภาษีมูลค่าเพิ่มประจำร้าน (VAT Rate %)
              </FieldLabel>
              <div className="mt-1 flex items-center">
                <Input
                  id="vat-rate"
                  type="number"
                  step="0.1"
                  placeholder="7.0"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="rounded-r-none"
                />
                <span className="border-input bg-muted text-muted-foreground flex h-9 items-center rounded-r-md border border-l-0 px-3 text-sm select-none">
                  %
                </span>
              </div>
              <FieldDescription className="text-muted-foreground mt-1 text-xs">
                ค่ามาตรฐานของประเทศไทยคือ 7.0%
              </FieldDescription>
            </Field>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end border-t">
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <IconLoader2 size={14} className="animate-spin" />{' '}
              กำลังอัปเดตระบบภาษี...
            </>
          ) : (
            <>
              <IconDeviceFloppy size={14} /> บันทึกการตั้งค่าภาษี
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
