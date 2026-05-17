'use client'

import { useState } from 'react'

import {
  IconBell,
  IconBuildingStore,
  IconCheck,
  IconDeviceFloppy,
  IconLoader2,
  IconLock,
  IconPhoto,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { Settings } from 'lucide-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

export function SettingsContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [storeConfigs, setStoreConfigs] = useState(MOCK_STORES_SETTINGS)

  const [isSavingStore, setIsSavingStore] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)

  const currentStoreConfig =
    storeConfigs[selectedStoreId as keyof typeof storeConfigs]

  const handleStoreConfigChange = (field: string, value: string) => {
    setStoreConfigs({
      ...storeConfigs,
      [selectedStoreId]: {
        ...currentStoreConfig,
        [field]: value,
      },
    })
  }

  const handleSaveStoreConfig = () => {
    setIsSavingStore(true)
    setTimeout(() => {
      setIsSavingStore(false)
    }, 1200)
  }

  const handleSaveSecurity = () => {
    setIsSavingSecurity(true)
    setTimeout(() => {
      setIsSavingSecurity(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconSettings}
        title="การตั้งค่าระบบ"
        description="จัดการข้อมูลโครงสร้างร้านค้าหลัก ปรับปรุงระบบความปลอดภัยชั้นสูง และควบคุมตัวเลือกแจ้งเตือนผ่านบัญชี"
      />

      <Tabs
        defaultValue="store-profile"
        orientation="vertical"
        className="flex flex-col gap-6 md:flex-row"
      >
        <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 md:w-57.5 md:flex-col">
          <TabsTrigger value="store-profile">
            <IconBuildingStore /> <span>ตั้งค่าข้อมูลร้านค้า</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <IconLock /> <span>ความปลอดภัยบัญชี</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <IconBell /> <span>ระบบแจ้งเตือนไลน์/อีเมล</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="store-profile"
          className="m-0 w-full grow focus-visible:outline-none"
        >
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            {/* <CardHeader className="bg-muted/20 flex flex-col items-start justify-between gap-4 border-b px-6 py-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <CardTitle className="text-foreground text-sm font-bold">
                  ข้อมูลโปรไฟล์แบรนด์และร้านค้าหลัก
                </CardTitle>
                <CardDescription className="text-xs">
                  แก้ไขข้อมูลสาขาหลัก, URL Slug หน้าระบบ
                  และข้อมูลข้อความหมายเหตุที่จะปรากฏในกระดาษใบเสร็จ POS
                </CardDescription>
              </div>

              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger className="bg-background h-9 w-full text-xs font-medium shadow-sm sm:w-60">
                  <SelectValue placeholder="เลือกแบรนด์ที่ต้องการตั้งค่า" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="store-1">
                    เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                  </SelectItem>
                  <SelectItem value="store-2">
                    ร้านกาแฟหอมกรุ่น Cafe & Bakery
                  </SelectItem>
                  <SelectItem value="store-3">
                    Gadget & IT Accessories
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader> */}

            <CardHeader>
              <PageTabHeader
                variant="secondary"
                icon={IconBuildingStore}
                title="ข้อมูลโปรไฟล์แบรนด์และร้านค้าหลัก"
                description="แก้ไขข้อมูลสาขาหลัก, URL Slug หน้าระบบ
                  และข้อมูลข้อความหมายเหตุที่จะปรากฏในกระดาษใบเสร็จ POS"
                endContent={
                  <Select
                    value={selectedStoreId}
                    onValueChange={setSelectedStoreId}
                  >
                    <SelectTrigger className="bg-background h-9 w-full text-xs font-medium shadow-sm sm:w-60">
                      <SelectValue placeholder="เลือกแบรนด์ที่ต้องการตั้งค่า" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="store-1">
                        เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                      </SelectItem>
                      <SelectItem value="store-2">
                        ร้านกาแฟหอมกรุ่น Cafe & Bakery
                      </SelectItem>
                      <SelectItem value="store-3">
                        Gadget & IT Accessories
                      </SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            </CardHeader>

            <CardContent className="space-y-6 p-6 text-xs">
              <div className="space-y-2.5">
                <Label className="text-foreground text-xs font-bold">
                  โลโก้ประจำแบรนด์ร้านค้า (Store Logo)
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 shadow-inner dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                    <IconPhoto size={22} />
                  </div>
                  <div className="space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="bg-background h-8 text-xs font-medium shadow-sm"
                    >
                      อัปโหลดรูปภาพใหม่
                    </Button>
                    <p className="text-muted-foreground text-[10px]">
                      แนะนำไฟล์สี่เหลี่ยมจัตุรัส PNG หรือ JPG ขนาดไม่เกิน 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="st-name"
                    className="text-foreground text-xs font-bold"
                  >
                    ชื่อร้านค้า / ชื่อจดทะเบียนพาณิชย์
                  </Label>
                  <Input
                    id="st-name"
                    className="bg-background"
                    placeholder="ระบุชื่อเต็มของร้านค้า"
                    value={currentStoreConfig?.name || ''}
                    onChange={(e) =>
                      handleStoreConfigChange('name', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="st-slug"
                    className="text-foreground text-xs font-bold"
                  >
                    Store URL Slug (ลิงก์หลักระบบ Sale Page)
                  </Label>
                  <div className="flex items-center overflow-hidden rounded-md shadow-sm">
                    <span className="text-muted-foreground border border-r-0 border-slate-200 bg-slate-100 px-3 py-2 font-mono text-[11px] select-none dark:border-slate-700 dark:bg-slate-800">
                      sitepow.store/
                    </span>
                    <Input
                      id="st-slug"
                      className="bg-background rounded-l-none font-mono focus-visible:ring-1"
                      placeholder="my-shop-slug"
                      value={currentStoreConfig?.slug || ''}
                      onChange={(e) =>
                        handleStoreConfigChange('slug', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="st-email"
                    className="text-foreground text-xs font-bold"
                  >
                    อีเมลติดต่อและส่งใบแจ้งหนี้หลัก (Store Email)
                  </Label>
                  <Input
                    id="st-email"
                    type="email"
                    className="bg-background"
                    placeholder="example@store.com"
                    value={currentStoreConfig?.email || ''}
                    onChange={(e) =>
                      handleStoreConfigChange('email', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="st-tax"
                    className="text-foreground text-xs font-bold"
                  >
                    เลขประจำตัวผู้เสียภาษี 13 หลัก (Tax ID)
                  </Label>
                  <Input
                    id="st-tax"
                    maxLength={13}
                    className="bg-background font-mono"
                    placeholder="เลขประจำตัวผู้เสียภาษีสำหรับระบุบนใบเสร็จเต็มรูปแบบ"
                    value={currentStoreConfig?.taxId || ''}
                    onChange={(e) =>
                      handleStoreConfigChange('taxId', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="st-footer"
                  className="text-foreground text-xs font-bold"
                >
                  ข้อความสโลแกนหรือเงื่อนไขท้ายใบเสร็จ (Receipt Footer Note)
                </Label>
                <Textarea
                  id="st-footer"
                  className="bg-background leading-relaxed"
                  rows={2}
                  placeholder="เช่น ขอบคุณที่เลือกอุดหนุนสินค้า หากพบปัญหาสามารถติดต่อเคลมภายใน 7 วัน"
                  value={currentStoreConfig?.receiptFooter || ''}
                  onChange={(e) =>
                    handleStoreConfigChange('receiptFooter', e.target.value)
                  }
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t">
              <Button
                size="sm"
                onClick={handleSaveStoreConfig}
                disabled={isSavingStore}
                className="gap-1.5 px-4 text-xs font-semibold"
              >
                {isSavingStore ? (
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
        </TabsContent>

        <TabsContent
          value="security"
          className="m-0 w-full grow focus-visible:outline-none"
        >
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader>
              <PageTabHeader
                variant="secondary"
                icon={IconUser}
                title="ความปลอดภัยบัญชีผู้ดูแลระบบหลัก"
                description="ปรับเปลี่ยนรหัสผ่านเพื่อการเข้าถึงฐานระบบหลัก มีผลบังคับใช้ครอบคลุมทุกแบรนด์ภายใต้สัญญานี้"
              />
            </CardHeader>

            <CardContent className="space-y-5 p-6 text-xs">
              <div className="max-w-md space-y-2">
                <Label
                  htmlFor="curr-pass"
                  className="text-foreground text-xs font-bold"
                >
                  รหัสผ่านปัจจุบันของคุณ (Current Password)
                </Label>
                <Input
                  id="curr-pass"
                  type="password"
                  className="bg-background"
                  placeholder="••••••••••••"
                />
              </div>
              <div className="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="new-pass"
                    className="text-foreground text-xs font-bold"
                  >
                    รหัสผ่านชุดใหม่ (New Password)
                  </Label>
                  <Input
                    id="new-pass"
                    type="password"
                    className="bg-background"
                    placeholder="ความยาวขั้นต่ำ 8 ตัวอักษร"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-pass"
                    className="text-foreground text-xs font-bold"
                  >
                    ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm New Password)
                  </Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    className="bg-background"
                    placeholder="กรอกให้ตรงกับช่องด้านซ้าย"
                  />
                </div>
              </div>

              <div className="mt-2 flex max-w-2xl items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                <div className="space-y-1 pr-4">
                  <span className="text-foreground block text-xs font-bold">
                    เปิดใช้งานมาตรการยืนยันตัวตน 2 ชั้น (Two-Factor
                    Authentication / 2FA)
                  </span>
                  <span className="text-muted-foreground block text-[11px] leading-relaxed">
                    เพิ่มเกราะป้องกันความปลอดภัยขั้นสูงสุดให้กับร้านค้า
                    โดยระบบจะบังคับส่งรหัส OTP
                    ผ่านอีเมลหรือแอปพลิเคชันทุกครั้งที่มีการล็อกอินผ่านเบราว์เซอร์หรืออุปกรณ์แปลกใหม่
                  </span>
                </div>
                <Switch />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t">
              <Button
                size="sm"
                onClick={handleSaveSecurity}
                disabled={isSavingSecurity}
                className="gap-1.5 px-4 text-xs font-semibold"
              >
                {isSavingSecurity ? (
                  <>
                    <IconLoader2 size={14} className="animate-spin" />{' '}
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <IconCheck size={14} /> อัปเดตรหัสผ่านใหม่
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="m-0 w-full grow focus-visible:outline-none"
        >
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader>
              <PageTabHeader
                variant="secondary"
                title="การตั้งค่าระบบกระจายการแจ้งเตือน"
                description="กำหนดพฤติกรรมการรับส่งข้อมูลสำคัญและตัวแจ้งเตือนแบบเรียลไทม์ของระบบหลังบ้านไปยังพนักงานและผู้บริหาร"
                icon={Settings}
              />
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-6 text-xs dark:divide-slate-800">
              <div className="flex items-center justify-between pb-4">
                <div className="space-y-1 pr-4">
                  <span className="text-foreground block font-bold">
                    ระบบแจ้งเตือนเมื่อสินค้าใกล้หมดคลังวิกฤต (Low Stock Alert
                    Automation)
                  </span>
                  <span className="text-muted-foreground block max-w-xl text-[11px] leading-relaxed">
                    ส่งอีเมลรายงานด่วนและแจ้งเตือนพนักงานคลังสินค้าทันทีเมื่อจำนวนพัสดุสินค้าคงเหลือในระบบ
                    POS ของสาขาใด ๆ มีค่าต่ำกว่าจุดสั่งซื้อขั้นต่ำ (Min Stock)
                    ที่ตั้งเอาไว้ตามกฎ Prisma Schema
                  </span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-1 pr-4">
                  <span className="text-foreground block font-bold">
                    รายงานสรุปยอดขายรายวันอัตโนมัติ (Daily Sales Analytical
                    Summary Email)
                  </span>
                  <span className="text-muted-foreground block max-w-xl text-[11px] leading-relaxed">
                    ทำการประมวลผลข้อมูลยอดจำหน่ายรวมของทุกร้านค้า
                    แล้วสรุปส่งเป็นรายงานสถิติเข้าอีเมลหลักของผู้ดูแลระบบ
                    เป็นประจำทุกคืนเวลา 23:59 น. สำหรับปิดรอบบัญชีประจำวัน
                  </span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1 pr-4">
                  <span className="text-foreground block font-bold">
                    แจ้งเตือนรอบบิลและค่าบริการเครดิต (Billing & Subscription
                    Lifecycle Alerts)
                  </span>
                  <span className="text-muted-foreground block max-w-xl text-[11px] leading-relaxed">
                    รับข้อมูลแจ้งเตือนล่วงหน้าเมื่อใกล้ถึงวันกำหนดชำระค่าบริการแพลนรายเดือน
                    หรือเมื่อโควตาการประมวลผลของ AI Vision และ AI Search
                    ใกล้หมดหลอดโควตาโบนัสฟรี
                  </span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
