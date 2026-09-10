'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

import {
  IconAlertTriangle,
  IconBox,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconDeviceDesktop,
  IconDownload,
  IconFileSpreadsheet,
  IconFileUpload,
  IconInfoCircle,
  IconKey,
  IconRefresh,
  IconTruckDelivery,
  IconUpload,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { BulkImportGuideDialog } from './BulkImportGuideDialog'

export interface BulkProductRow {
  index: number
  title: string
  productType: 'PHYSICAL' | 'DIGITAL_LINK' | 'DIGITAL_ITEM' | 'DIGITAL_SERVICE'
  variantTitle: string
  sku: string
  price: number
  costPrice?: number
  categorySlug?: string
  initialStock?: number
  weight?: number
  digitalUrl?: string
  digitalItemContent?: string
  pointsAmount?: number
  discountType?: 'PERCENTAGE' | 'FIXED'
  discountAmount?: number
  error?: string
}

interface BulkImportProductsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onSuccess?: () => void
}

type ImportStep = 'upload' | 'preview' | 'processing'
type FilterMode = 'all' | 'valid' | 'errors'
type TemplateType =
  'ALL' | 'PHYSICAL' | 'DIGITAL_LINK' | 'DIGITAL_ITEM' | 'DIGITAL_SERVICE'

export function BulkImportProductsDialog({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: BulkImportProductsDialogProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [inputTab, setInputTab] = useState<'file' | 'paste'>('file')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [rawText, setRawText] = useState('')

  const [parsedRows, setParsedRows] = useState<BulkProductRow[]>([])
  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleDownloadTemplate = (type: TemplateType = 'ALL') => {
    const headers = [
      'Title',
      'ProductType',
      'VariantTitle',
      'SKU',
      'Price',
      'CostPrice',
      'CategorySlug',
      'InitialStock',
      'WeightKg',
      'DigitalUrl',
      'DigitalItemContent',
      'PointsAmount',
      'DiscountType',
      'DiscountAmount',
    ].join(',')

    const samples: Record<TemplateType, string[]> = {
      ALL: [
        'เสื้อยืด Oversize สีดำ,PHYSICAL,Free Size,TSHIRT-BLK-OS,450,180,apparel,50,0.25,,,,PERCENTAGE,10',
        'คู่มือการตลาด E-Book 2026,DIGITAL_LINK,Standard,EBOOK-MKT-01,299,0,books,999,,https://drive.google.com/file/d/sample,,,',
        'Gift Card 500 THB,DIGITAL_ITEM,Standard,GC-500-01,500,480,gift-card,1,,,CARD-ABCD-1234-XYZ,10,,',
        'บริการตรวจสุขภาพประจำปี,DIGITAL_SERVICE,Standard,SRV-HEALTH-01,1500,600,service,999,,,,50,,',
      ],
      PHYSICAL: [
        'เสื้อยืด Oversize สีดำ,PHYSICAL,Free Size,TSHIRT-BLK-OS,450,180,apparel,50,0.25,,,,PERCENTAGE,10',
        'กางเกงยีนส์ขากระบอก,PHYSICAL,32,JEANS-BLU-32,890,350,apparel,20,0.6,,,,,',
      ],
      DIGITAL_LINK: [
        'คู่มือการตลาด E-Book 2026,DIGITAL_LINK,Standard,EBOOK-MKT-01,299,0,books,999,,https://drive.google.com/file/d/sample,,,',
        'ชุด Preset แต่งภาพ Lightroom,DIGITAL_LINK,Standard,LR-PRESET-01,490,0,software,999,,https://example.com/download/preset.zip,10,,',
      ],
      DIGITAL_ITEM: [
        'Gift Card 500 THB,DIGITAL_ITEM,Standard,GC-500-01,500,480,gift-card,1,,,CARD-ABCD-1234-XYZ,10,,',
        'Serial Key โปรแกรมตัดต่อ,DIGITAL_ITEM,Standard,KEY-SOFT-01,1200,900,keys,1,,,PRO-XXXX-YYYY-ZZZZ,,,',
      ],
      DIGITAL_SERVICE: [
        'บริการตรวจสุขภาพประจำปี,DIGITAL_SERVICE,Standard,SRV-HEALTH-01,1500,600,service,999,,,,50,,',
        'ปรึกษาผู้เชี่ยวชาญ 1 ชม.,DIGITAL_SERVICE,Standard,SRV-CONSULT-01,2500,0,service,999,,,,100,,',
      ],
    }

    const fileNames: Record<TemplateType, string> = {
      ALL: 'products_template_all.csv',
      PHYSICAL: 'products_template_physical.csv',
      DIGITAL_LINK: 'products_template_digital_link.csv',
      DIGITAL_ITEM: 'products_template_digital_item.csv',
      DIGITAL_SERVICE: 'products_template_digital_service.csv',
    }

    const csvContent = headers + '\n' + samples[type].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileNames[type])
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const processText = (text: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0) {
      toast.error('ไม่พบชุดข้อมูลในไฟล์')
      return
    }

    const firstLine = lines[0].toLowerCase()
    const startIndex =
      firstLine.includes('sku') || firstLine.includes('title') ? 1 : 0

    const rows: BulkProductRow[] = []

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i]
        .split(',')
        .map((col) => col.trim().replace(/^["']|["']$/g, ''))

      const title = cols[0] || ''
      const rawType = (cols[1] || 'PHYSICAL').toUpperCase()
      const productType = (
        [
          'PHYSICAL',
          'DIGITAL_LINK',
          'DIGITAL_ITEM',
          'DIGITAL_SERVICE',
        ].includes(rawType)
          ? rawType
          : 'PHYSICAL'
      ) as BulkProductRow['productType']

      const variantTitle = cols[2] || 'Standard'
      const sku = cols[3] || ''
      const price = parseFloat(cols[4])
      const costPrice = cols[5] ? parseFloat(cols[5]) : 0
      const categorySlug = cols[6] || ''
      const initialStock = cols[7] ? parseInt(cols[7], 10) : 0
      const weight = cols[8] ? parseFloat(cols[8]) : undefined
      const digitalUrl = cols[9] || undefined
      const digitalItemContent = cols[10] || undefined
      const pointsAmount = cols[11] ? parseInt(cols[11], 10) : 0
      const rawDiscountType = (cols[12] || '').toUpperCase()
      const discountType = ['PERCENTAGE', 'FIXED'].includes(rawDiscountType)
        ? (rawDiscountType as 'PERCENTAGE' | 'FIXED')
        : undefined
      const discountAmount = cols[13] ? parseFloat(cols[13]) : undefined

      let error = ''
      if (!title) error = 'ต้องระบุชื่อสินค้า'
      else if (!sku) error = 'ต้องระบุ SKU'
      else if (isNaN(price) || price < 0) error = 'ราคาจำหน่ายไม่ถูกต้อง'
      else if (productType === 'DIGITAL_LINK' && !digitalUrl) {
        error = 'ประเภท DIGITAL_LINK ต้องมี URL ดาวน์โหลด'
      } else if (productType === 'DIGITAL_ITEM' && !digitalItemContent) {
        error = 'ประเภท DIGITAL_ITEM ต้องระบุ Code/ข้อความ'
      }

      rows.push({
        index: i + 1,
        title,
        productType,
        variantTitle,
        sku,
        price: isNaN(price) ? 0 : price,
        costPrice: isNaN(costPrice) ? 0 : costPrice,
        categorySlug,
        initialStock: isNaN(initialStock) ? 0 : initialStock,
        weight,
        digitalUrl,
        digitalItemContent,
        pointsAmount,
        discountType,
        discountAmount,
        error: error || undefined,
      })
    }

    setParsedRows(rows)
    setCurrentStep('preview')
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) return
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('กรุณาเลือกไฟล์รูปแบบ .csv เท่านั้น')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      processText(content)
    }
    reader.readAsText(file)
  }

  const handlePasteAnalyze = () => {
    if (!rawText.trim()) {
      toast.error('กรุณาระบุข้อมูลสินค้า')
      return
    }
    processText(rawText)
  }

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => !r.error)
    if (validRows.length === 0) {
      toast.error('ไม่มีรายการที่ถูกต้องสำหรับนำเข้า')
      return
    }

    setCurrentStep('processing')
    setImportProgress(20)

    try {
      await new Promise((r) => setTimeout(r, 600))
      setImportProgress(60)

      await new Promise((r) => setTimeout(r, 400))
      setImportProgress(100)

      toast.success(`นำเข้าสินค้าสำเร็จจำนวน ${validRows.length} รายการ`)
      handleFullReset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('เกิดข้อผิดพลาดระหว่างกระบวนการนำเข้า')
      setCurrentStep('preview')
    }
  }

  const handleFullReset = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setRawText('')
    setParsedRows([])
    setFilterMode('all')
    setImportProgress(0)
  }

  const validCount = parsedRows.filter((r) => !r.error).length
  const errorCount = parsedRows.filter((r) => !!r.error).length

  const filteredDisplayRows = parsedRows.filter((r) => {
    if (filterMode === 'valid') return !r.error
    if (filterMode === 'errors') return !!r.error
    return true
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleFullReset()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <div className="bg-muted/20 border-b p-6">
          <div className="flex items-center justify-between">
            <DialogHeaderIcon
              icon={IconFileSpreadsheet}
              title="นำเข้าสินค้าเป็นชุด (Bulk Import Products)"
              description="รองรับข้อมูลรูปแบบ CSV พร้อมระบบตรวจสอบความถูกต้องก่อนบันทึกจริง"
            />

            <div className="hidden items-center gap-2 text-xs font-medium sm:flex">
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  currentStep === 'upload'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                1. อัปโหลด
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  currentStep === 'preview'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                2. ตรวจสอบ ({validCount})
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  currentStep === 'processing'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                3. บันทึกผล
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="border-primary/20 bg-primary/5 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <IconInfoCircle className="text-primary h-5 w-5 shrink-0" />
                  <div className="text-xs">
                    <p className="text-foreground font-semibold">
                      ต้องการศึกษาขอบเขตฟิลด์ หรือดาวน์โหลดแม่แบบ?
                    </p>
                    <p className="text-muted-foreground">
                      ตรวจสอบเงื่อนไขข้อมูลที่ยอมรับ หรือดาวน์โหลด Template CSV
                      ตามประเภทสินค้าที่ต้องการ
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <BulkImportGuideDialog />

                  {/* Dropdown Menu ตัวเลือกแม่แบบ Template ครบ 4 ประเภท */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-background gap-1.5 text-xs shadow-sm"
                      >
                        <IconDownload className="h-3.5 w-3.5" />
                        ดาวน์โหลด Template
                        <IconChevronDown className="h-3 w-3 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 text-xs">
                      <DropdownMenuLabel className="text-muted-foreground text-[11px] font-semibold">
                        เลือกประเภท Template
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('ALL')}
                        className="cursor-pointer gap-2"
                      >
                        <IconFileSpreadsheet className="size-4" />
                        รวมทุกประเภทสินค้า (แนะนำ)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('PHYSICAL')}
                        className="cursor-pointer gap-2"
                      >
                        <IconBox className="size-4" />
                        สินค้าจับต้องได้ (PHYSICAL)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('DIGITAL_LINK')}
                        className="cursor-pointer gap-2"
                      >
                        <IconDeviceDesktop className="size-4" />
                        ไฟล์ดาวน์โหลด (DIGITAL_LINK)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('DIGITAL_ITEM')}
                        className="cursor-pointer gap-2"
                      >
                        <IconKey className="size-4" />
                        รหัสโค้ด / ซีเรียล (DIGITAL_ITEM)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownloadTemplate('DIGITAL_SERVICE')
                        }
                        className="cursor-pointer gap-2"
                      >
                        <IconTruckDelivery className="size-4" />
                        คอร์ส / บริการ (DIGITAL_SERVICE)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <Tabs
                value={inputTab}
                onValueChange={(v) => setInputTab(v as 'file' | 'paste')}
              >
                <TabsList className="mx-auto grid w-full max-w-sm grid-cols-2">
                  <TabsTrigger value="file" className="gap-1.5 text-xs">
                    <IconFileUpload className="size-4" /> อัปโหลดไฟล์ .CSV
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="gap-1.5 text-xs">
                    <IconUpload className="size-4" /> วางข้อมูลโดยตรง
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="mt-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragging(false)
                      handleFileChange(e.dataTransfer.files?.[0])
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200 ${
                      isDragging
                        ? 'border-primary bg-primary/5 scale-[0.99]'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                    <div className="bg-background mb-3 rounded-full border p-4 shadow-sm">
                      <IconFileUpload className="text-primary h-8 w-8" />
                    </div>
                    <p className="text-foreground text-sm font-semibold">
                      คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ CSV มาวางที่นี่
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      รองรับเฉพาะไฟล์ .csv ขนาดไม่เกิน 10MB
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="paste" className="mt-4 space-y-3">
                  <Textarea
                    rows={8}
                    placeholder={
                      'Title,ProductType,VariantTitle,SKU,Price,CostPrice,CategorySlug,InitialStock,WeightKg,DigitalUrl,DigitalItemContent,PointsAmount,DiscountType,DiscountAmount\nเสื้อยืดแขนสั้น,PHYSICAL,Free Size,TSHIRT-01,250,100,apparel,50,0.25,,,,PERCENTAGE,10'
                    }
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="font-mono text-xs leading-relaxed"
                  />
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>* บรรทัดแรกสามารถเป็นชื่อคอลัมน์ (Header) ได้</span>
                    <Button
                      size="sm"
                      onClick={handlePasteAnalyze}
                      disabled={!rawText.trim()}
                    >
                      ตรวจสอบข้อมูล
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => setFilterMode('all')}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    filterMode === 'all'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <p className="text-muted-foreground text-xs font-medium">
                    รายการทั้งหมด
                  </p>
                  <p className="text-foreground mt-1 text-xl font-bold">
                    {parsedRows.length}
                  </p>
                </div>
                <div
                  onClick={() => setFilterMode('valid')}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    filterMode === 'valid'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <IconCheck className="h-3.5 w-3.5" /> พร้อมนำเข้า
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {validCount}
                  </p>
                </div>
                <div
                  onClick={() => setFilterMode('errors')}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    filterMode === 'errors'
                      ? 'border-destructive bg-destructive/10 shadow-sm'
                      : 'bg-card hover:bg-muted/40'
                  }`}
                >
                  <p className="text-destructive flex items-center gap-1 text-xs font-medium">
                    <IconAlertTriangle className="h-3.5 w-3.5" /> พบข้อผิดพลาด
                  </p>
                  <p className="text-destructive mt-1 text-xl font-bold">
                    {errorCount}
                  </p>
                </div>
              </div>
              <div className="bg-card overflow-hidden rounded-xl border">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-muted/60 sticky top-0 border-b backdrop-blur-sm">
                      <tr>
                        <th className="text-muted-foreground p-2.5 font-semibold">
                          แถว
                        </th>
                        <th className="text-muted-foreground p-2.5 font-semibold">
                          ชื่อสินค้า
                        </th>
                        <th className="text-muted-foreground p-2.5 font-semibold">
                          SKU
                        </th>
                        <th className="text-muted-foreground p-2.5 text-right font-semibold">
                          ราคา
                        </th>
                        <th className="text-muted-foreground p-2.5 text-right font-semibold">
                          ต้นทุน
                        </th>
                        <th className="text-muted-foreground p-2.5 font-semibold">
                          หมวดหมู่
                        </th>
                        <th className="text-muted-foreground p-2.5 text-center font-semibold">
                          สต็อก
                        </th>
                        <th className="text-muted-foreground p-2.5 text-center font-semibold">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredDisplayRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-muted-foreground p-8 text-center"
                          >
                            ไม่พบรายการตามเงื่อนไขที่เลือก
                          </td>
                        </tr>
                      ) : (
                        filteredDisplayRows.map((row) => (
                          <tr
                            key={row.index}
                            className={`transition-colors ${
                              row.error
                                ? 'bg-destructive/5 hover:bg-destructive/10'
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            <td className="text-muted-foreground p-2.5 font-mono">
                              #{row.index}
                            </td>
                            <td className="max-w-45 truncate p-2.5 font-medium">
                              {row.title || '—'}
                            </td>
                            <td className="text-muted-foreground p-2.5 font-mono">
                              {row.sku || '—'}
                            </td>
                            <td className="p-2.5 text-right font-medium">
                              ฿{row.price.toLocaleString()}
                            </td>
                            <td className="text-muted-foreground p-2.5 text-right">
                              ฿{row.costPrice?.toLocaleString() || '0'}
                            </td>
                            <td className="p-2.5">
                              {row.categorySlug ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {row.categorySlug}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-semibold">
                              {row.initialStock ?? 0}
                            </td>
                            <td className="p-2.5 text-center">
                              {row.error ? (
                                <span
                                  className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                                  title={row.error}
                                >
                                  <IconAlertTriangle className="h-3 w-3" />
                                  {row.error}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                  <IconCheck className="h-3 w-3" /> ผ่าน
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {currentStep === 'processing' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <div className="border-primary/20 bg-primary/10 animate-pulse rounded-full border p-4">
                <IconClock className="text-primary h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  กำลังนำเข้าข้อมูลเข้าสู่ระบบ
                </h3>
                <p className="text-muted-foreground text-xs">
                  ระบบกำลังสร้างสินค้าและอัปเดตสต็อกสาขา กรุณาอย่าปิดหน้านี้
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Progress value={importProgress} className="h-2" />
                <span className="text-muted-foreground font-mono text-xs">
                  {importProgress}%
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="bg-muted/10 flex items-center justify-between border-t p-4">
          {currentStep === 'preview' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleFullReset}
              >
                <IconRefresh className="h-3.5 w-3.5" /> เลือกไฟล์ใหม่
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={validCount === 0}
                  className="gap-1.5 shadow-sm"
                >
                  <IconUpload className="size-4" />
                  ยืนยันนำเข้า ({validCount} รายการ)
                </Button>
              </div>
            </>
          ) : currentStep === 'upload' ? (
            <>
              <span className="text-muted-foreground text-xs">
                รองรับการนำเข้าสูงสุด 500 รายการต่อรอบ
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                ปิดหน้าต่าง
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
