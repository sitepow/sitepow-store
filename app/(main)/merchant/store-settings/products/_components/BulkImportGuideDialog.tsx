'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useTranslations } from 'next-intl'

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products.bulkImportGuide')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground w-full justify-center gap-1.5 text-xs sm:w-auto"
        >
          <IconBook className="size-4" /> {t('triggerBtn')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties} className="flex max-h-[90vh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[85vh] sm:w-full sm:max-w-4xl">
        <DialogHeader className="bg-muted/20 border-b p-4 text-left sm:p-6">
          <DialogHeaderIcon
            icon={IconBook}
            title={t('title')}
            description={t('description')}
            className="pr-6 sm:pr-0"
          />
        </DialogHeader>
        <Tabs
          defaultValue="fields"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="bg-muted/5 border-b px-4 py-2.5 sm:px-6 sm:py-3">
            <TabsList className="grid h-9 w-full grid-cols-2 sm:inline-flex sm:w-auto">
              <TabsTrigger value="fields" className="gap-1.5 text-xs">
                <span className="sm:hidden">
                  {t('tabFieldsShort', { count: FIELD_DICTIONARY.length })}
                </span>
                <span className="hidden sm:inline">
                  {t('tabFields', { count: FIELD_DICTIONARY.length })}
                </span>
              </TabsTrigger>
              <TabsTrigger value="product-types" className="gap-1.5 text-xs">
                <span className="sm:hidden">{t('tabProductTypesShort')}</span>
                <span className="hidden sm:inline">{t('tabProductTypes')}</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="fields"
            className="m-0 flex-1 overflow-y-auto p-3.5 sm:p-6"
          >
            <div className="text-muted-foreground mb-2 flex items-center justify-between text-[11px] sm:hidden">
              <span>{t('mobileScrollHint')}</span>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                <thead className="bg-muted/80 sticky top-0 z-10 border-b backdrop-blur-sm">
                  <tr>
                    <th className="p-2.5 font-semibold whitespace-nowrap sm:p-3">
                      {t('colName')}
                    </th>
                    <th className="p-2.5 font-semibold whitespace-nowrap sm:p-3">
                      {t('colRequired')}
                    </th>
                    <th className="p-2.5 font-semibold whitespace-nowrap sm:p-3">
                      {t('colType')}
                    </th>
                    <th className="min-w-56 p-2.5 font-semibold sm:min-w-64 sm:p-3">
                      {t('colDesc')}
                    </th>
                    <th className="p-2.5 font-semibold whitespace-nowrap sm:p-3">
                      {t('colExample')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {FIELD_DICTIONARY.map((field) => {
                    const fieldDesc = t.has(`fields.${field.name}.desc` as any)
                      ? t(`fields.${field.name}.desc` as any)
                      : field.description
                    const fieldExample = t.has(
                      `fields.${field.name}.example` as any,
                    )
                      ? t(`fields.${field.name}.example` as any)
                      : field.example

                    return (
                      <tr key={field.name} className="hover:bg-muted/20">
                        <td className="text-foreground p-2.5 font-semibold whitespace-nowrap sm:p-3">
                          {field.name}
                        </td>
                        <td className="p-2.5 whitespace-nowrap sm:p-3">
                          {field.required ? (
                            <Badge
                              variant="destructive"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {t('requiredBadge')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {t('optionalBadge')}
                            </Badge>
                          )}
                        </td>
                        <td className="text-muted-foreground p-2.5 whitespace-nowrap sm:p-3">
                          {field.type}
                        </td>
                        <td className="p-2.5 sm:p-3">
                          <p className="text-foreground leading-relaxed">
                            {fieldDesc}
                          </p>
                          {field.allowedValues && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {field.allowedValues.map((v) => (
                                <code
                                  key={v}
                                  className="bg-muted text-primary rounded px-1.5 py-0.5 text-[10px]"
                                >
                                  {v}
                                </code>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="text-muted-foreground p-2.5 whitespace-nowrap sm:p-3">
                          {fieldExample}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent
            value="product-types"
            className="m-0 flex-1 space-y-4 overflow-y-auto p-3.5 sm:p-6"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="bg-card space-y-2 rounded-xl border p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <IconBox className="size-4 shrink-0" />
                  {t('physicalTitle')}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('physicalDesc')}
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 text-[11px]">
                  {t('physicalTip')}
                </div>
              </div>
              <div className="bg-card space-y-2 rounded-xl border p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <IconDeviceDesktop className="size-4 shrink-0" />
                  {t('digitalLinkTitle')}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('digitalLinkDesc')}
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 text-[11px]">
                  {t('digitalLinkTip')}
                </div>
              </div>
              <div className="bg-card space-y-2 rounded-xl border p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <IconKey className="size-4 shrink-0" />
                  {t('digitalItemTitle')}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('digitalItemDesc')}
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 text-[11px]">
                  {t('digitalItemTip')}
                </div>
              </div>
              <div className="bg-card space-y-2 rounded-xl border p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <IconTruckDelivery className="size-4 shrink-0" />
                  {t('digitalServiceTitle')}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('digitalServiceDesc')}
                </p>
                <div className="bg-muted text-muted-foreground rounded p-2 text-[11px]">
                  {t('digitalServiceTip')}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="bg-muted/10 flex justify-end border-t p-3.5 sm:p-4">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              {t('closeBtn')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
