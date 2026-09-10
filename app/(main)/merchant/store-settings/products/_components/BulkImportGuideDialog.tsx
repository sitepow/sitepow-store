'use client'

import {
  IconBook,
  IconBox,
  IconDeviceDesktop,
  IconKey,
  IconTruckDelivery,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FieldDoc {
  name: string
  required: boolean
  type: string
  example: string
  description: string
  allowedValues?: string[]
}

const FIELD_DICTIONARY: FieldDoc[] = [
  {
    name: 'Title',
    required: true,
    type: 'String',
    example: 'เสื้อยืดแขนสั้น Cotton 100%',
    description: 'ชื่อสินค้าหลักที่จะแสดงบนหน้าร้านและหน้า POS',
  },
  {
    name: 'ProductType',
    required: true,
    type: 'Enum',
    example: 'PHYSICAL',
    description:
      'ประเภทของสินค้า ส่งผลต่อการคำนวณน้ำหนัก การจัดส่ง และการส่งมอบ',
    allowedValues: [
      'PHYSICAL',
      'DIGITAL_LINK',
      'DIGITAL_ITEM',
      'DIGITAL_SERVICE',
    ],
  },
  {
    name: 'VariantTitle',
    required: false,
    type: 'String',
    example: 'Size L สีดำ',
    description:
      'ชื่อตัวเลือกย่อยของสินค้า หากเว้นว่างไว้ระบบจะใช้ค่า "Standard"',
  },
  {
    name: 'SKU',
    required: true,
    type: 'String',
    example: 'TSHIRT-BLK-L',
    description: 'รหัสสินค้าหรือบาร์โค้ดประจำตัวเลือก (ห้ามซ้ำกันในระบบ)',
  },
  {
    name: 'Price',
    required: true,
    type: 'Decimal',
    example: '390',
    description: 'ราคาขายหน้าร้าน (ตัวเลขจำนวนเต็มหรือทศนิยม ไม่ติดลบ)',
  },
  {
    name: 'CostPrice',
    required: false,
    type: 'Decimal',
    example: '180',
    description: 'ต้นทุนสินค้าเพื่อใช้คำนวณกำไร-ขาดทุนในรายงาน (ค่าเริ่มต้น 0)',
  },
  {
    name: 'CategorySlug',
    required: false,
    type: 'String (Slug)',
    example: 'apparel',
    description:
      'สลักของหมวดหมู่สินค้าที่มีอยู่แล้วในระบบ หากไม่ตรงจะจัดเป็นไม่มีหมวดหมู่',
  },
  {
    name: 'InitialStock',
    required: false,
    type: 'Integer',
    example: '50',
    description: 'จำนวนสต็อกเริ่มต้นสำหรับสาขาที่เลือกทำงาน (ค่าเริ่มต้น 0)',
  },
  {
    name: 'WeightKg',
    required: false,
    type: 'Float',
    example: '0.35',
    description:
      'น้ำหนักสินค้าหน่วยเป็น กิโลกรัม (จำเป็นต้องระบุหากคำนวณค่าส่งตามน้ำหนัก)',
  },
  {
    name: 'DigitalUrl',
    required: false,
    type: 'URL String',
    example: 'https://drive.google.com/file/d/sample',
    description:
      'ลิงก์ดาวน์โหลดไฟล์ (บังคับระบุเมื่อ ProductType = DIGITAL_LINK)',
  },
  {
    name: 'DigitalItemContent',
    required: false,
    type: 'Text',
    example: 'STEAM-KEY-XXXX-YYYY',
    description:
      'รหัสโค้ด, ซีเรียล หรือข้อความที่จะส่งให้ลูกค้า (บังคับระบุเมื่อ ProductType = DIGITAL_ITEM)',
  },
  {
    name: 'PointsAmount',
    required: false,
    type: 'Integer',
    example: '15',
    description: 'แต้มสะสมที่จะได้รับเมื่อซื้อสินค้าชิ้นนี้ (ค่าเริ่มต้น 0)',
  },
  {
    name: 'DiscountType',
    required: false,
    type: 'Enum',
    example: 'PERCENTAGE',
    description: 'รูปแบบส่วนลดของสินค้าตัวเลือกนี้',
    allowedValues: ['PERCENTAGE', 'FIXED'],
  },
  {
    name: 'DiscountAmount',
    required: false,
    type: 'Decimal',
    example: '10',
    description:
      'มูลค่าส่วนลด (หากเลือก PERCENTAGE คือ 10%, หากเลือก FIXED คือ 10 บาท)',
  },
]

export function BulkImportGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
        >
          <IconBook className="size-4" /> คู่มือฟิลด์ข้อมูล (Guide)
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeaderIcon
          icon={IconBook}
          title="คำอธิบายฟิลด์ข้อมูลนำเข้า (Data Schema Dictionary)"
          description="รายละเอียด ขอบเขตค่า และข้อกำหนดทางเทคนิคสำหรับการนำเข้าสินค้าผ่าน
            CSV"
        />
        <Tabs
          defaultValue="fields"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="bg-muted/5 border-b px-6 pt-3">
            <TabsList className="h-9">
              <TabsTrigger value="fields" className="gap-1.5 text-xs">
                ตารางฟิลด์ทั้งหมด ({FIELD_DICTIONARY.length})
              </TabsTrigger>
              <TabsTrigger value="product-types" className="gap-1.5 text-xs">
                ประเภทสินค้า (Product Types)
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="fields"
            className="m-0 flex-1 overflow-y-auto p-6"
          >
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-175 border-collapse text-left text-xs">
                <thead className="bg-muted/80 sticky top-0 z-10 border-b backdrop-blur-sm">
                  <tr>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      ชื่อคอลัมน์ (Header)
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      ความจำเป็น
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      ชนิดข้อมูล (Type)
                    </th>
                    <th className="min-w-60 p-3 font-semibold">
                      คำอธิบายและขอบเขต
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      ตัวอย่าง
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {FIELD_DICTIONARY.map((field) => (
                    <tr key={field.name} className="hover:bg-muted/20">
                      <td className="text-foreground p-3 font-mono font-semibold whitespace-nowrap">
                        {field.name}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {field.required ? (
                          <Badge
                            variant="destructive"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            บังคับ
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            ไม่บังคับ
                          </Badge>
                        )}
                      </td>
                      <td className="text-muted-foreground p-3 font-mono whitespace-nowrap">
                        {field.type}
                      </td>
                      <td className="p-3">
                        <p className="text-foreground leading-relaxed">
                          {field.description}
                        </p>
                        {field.allowedValues && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {field.allowedValues.map((v) => (
                              <code
                                key={v}
                                className="bg-muted text-primary rounded px-1.5 py-0.5 font-mono text-[10px]"
                              >
                                {v}
                              </code>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="text-muted-foreground p-3 font-mono whitespace-nowrap">
                        {field.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent
            value="product-types"
            className="m-0 flex-1 space-y-4 overflow-y-auto p-6"
          >
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-card space-y-2 rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <IconBox className="size-4 shrink-0" />
                  PHYSICAL (สินค้ามีตัวตน)
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  สินค้าที่ต้องมีสต็อก มีการบรรจุหีบห่อ และต้องการข้อมูล{' '}
                  <code>WeightKg</code> สำหรับคิดคำนวณค่าจัดส่งตามจริง
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 font-mono text-[11px]">
                  ฟิลด์แนะนำ: InitialStock, WeightKg
                </div>
              </div>
              <div className="bg-card space-y-2 rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <IconDeviceDesktop className="size-4 shrink-0" />
                  DIGITAL_LINK (ไฟล์ดาวน์โหลด)
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  สินค้าดิจิทัล เช่น E-Book, ซอฟต์แวร์, คอร์สไฟล์
                  ลูกค้าจะได้รับลิงก์ดาวน์โหลดทันทีหลังชำระเงินเรียบร้อย
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 font-mono text-[11px]">
                  ฟิลด์บังคับ: DigitalUrl
                </div>
              </div>
              <div className="bg-card space-y-2 rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <IconKey className="size-4 shrink-0" />
                  DIGITAL_ITEM (รหัสโค้ด / Serial)
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  คีย์เกม บัตรเติมเงิน คูปอง หรือชุดตัวเลข โดยระบบจะนำเนื้อหาใน{' '}
                  <code>DigitalItemContent</code> ไปส่งมอบให้ลูกค้า
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 font-mono text-[11px]">
                  ฟิลด์บังคับ: DigitalItemContent
                </div>
              </div>
              <div className="bg-card space-y-2 rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <IconTruckDelivery className="size-4 shrink-0" />
                  DIGITAL_SERVICE (บริการ)
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  บริการทางวิชาชีพ การจองคิว หรือให้คำปรึกษา
                  ไม่จำเป็นต้องใช้น้ำหนักและการขนส่ง
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 font-mono text-[11px]">
                  ฟิลด์แนะนำ: PointsAmount, Price
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
