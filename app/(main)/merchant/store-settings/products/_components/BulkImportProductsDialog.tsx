'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useBranchOptions } from '@/actions/hooks/branch'
import { useBulkImportProducts } from '@/actions/hooks/product'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { useCurrentStore } from '@/hooks/use-current-store'
import {
  IconAlertTriangle,
  IconBox,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconDeviceDesktop,
  IconDownload,
  IconExternalLink,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { cn } from '@/lib/utils'

import { BulkImportGuideDialog } from './BulkImportGuideDialog'

export interface BulkProductRow {
  index: number
  title: string
  productType:
    | 'PHYSICAL'
    | 'DIGITAL_LINK'
    | 'DIGITAL_ITEM'
    | 'DIGITAL_SERVICE'
    | 'AFFILIATE_LINK'
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
  | 'ALL'
  | 'PHYSICAL'
  | 'DIGITAL_LINK'
  | 'DIGITAL_ITEM'
  | 'DIGITAL_SERVICE'
  | 'AFFILIATE_LINK'

export function BulkImportProductsDialog({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: BulkImportProductsDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.products.bulkImport')

  const { data: branchOptions = [] } = useBranchOptions(storeId)
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const bulkImportMutation = useBulkImportProducts()

  const activeBranchId =
    selectedBranchId ||
    branchOptions.find((b) => b.isMain)?.id ||
    branchOptions[0]?.id ||
    ''

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
        'หูฟังไร้สาย Bluetooth,AFFILIATE_LINK,Shopee Mall,AFF-SHP-EAR-01,399,0,electronics,999,,https://s.shopee.co.th/sample,,,PERCENTAGE,20',
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
      AFFILIATE_LINK: [
        'หูฟังไร้สาย Bluetooth,AFFILIATE_LINK,Shopee Mall,AFF-SHP-EAR-01,399,0,electronics,999,,https://s.shopee.co.th/sample,,,PERCENTAGE,20',
        'โต๊ะคอมพิวเตอร์ปรับระดับ,AFFILIATE_LINK,Lazada Official,AFF-LAZ-DSK-01,2490,0,furniture,999,,https://s.lazada.co.th/s.sample,,,FIXED,500',
        'ไมโครโฟนไร้สายมือถือ,AFFILIATE_LINK,TikTok Shop,AFF-TIK-MIC-01,590,0,gadgets,999,,https://vt.tiktok.com/sample,,,',
      ],
    }

    const fileNames: Record<TemplateType, string> = {
      ALL: 'products_template_all.csv',
      PHYSICAL: 'products_template_physical.csv',
      DIGITAL_LINK: 'products_template_digital_link.csv',
      DIGITAL_ITEM: 'products_template_digital_item.csv',
      DIGITAL_SERVICE: 'products_template_digital_service.csv',
      AFFILIATE_LINK: 'products_template_affiliate.csv',
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
      toast.error(t('fileEmpty'))
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
          'AFFILIATE_LINK',
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
      if (!title) error = t('errTitleMin')
      else if (!sku) error = t('errSkuEmpty')
      else if (isNaN(price) || price < 0) error = t('errPriceNonNegative')
      else if (
        (productType === 'DIGITAL_LINK' || productType === 'AFFILIATE_LINK') &&
        !digitalUrl
      ) {
        error = t('errDigitalUrlRequired')
      } else if (productType === 'DIGITAL_ITEM' && !digitalItemContent) {
        error = t('errDigitalItemContentRequired')
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
      toast.error(t('selectCsvFile'))
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
      toast.error(t('fileEmpty'))
      return
    }
    processText(rawText)
  }

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => !r.error)
    if (validRows.length === 0) {
      toast.error(t('emptyFilteredRows'))
      return
    }

    setCurrentStep('processing')
    setImportProgress(25)

    try {
      const res = await bulkImportMutation.mutateAsync({
        storeId,
        branchId: activeBranchId || undefined,
        products: validRows.map((r) => ({
          title: r.title,
          productType: r.productType,
          variantTitle: r.variantTitle,
          sku: r.sku,
          price: r.price,
          costPrice: r.costPrice,
          categorySlug: r.categorySlug,
          initialStock: r.initialStock,
          weight: r.weight,
          digitalUrl: r.digitalUrl,
          digitalItemContent: r.digitalItemContent,
          pointsAmount: r.pointsAmount,
          discountType: r.discountType,
          discountAmount: r.discountAmount,
        })),
      })

      if (!res.success) {
        setCurrentStep('preview')
        return
      }

      setImportProgress(100)
      handleFullReset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
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
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:w-full sm:max-w-3xl"
      >
        <DialogHeader className="bg-muted/20 border-b p-4 text-left sm:p-6">
          <div className="flex flex-col items-center gap-2.5">
            <DialogHeaderIcon
              icon={IconFileSpreadsheet}
              title={t('title')}
              description={t('description')}
              className="pr-6 sm:pr-0"
            />

            <div className="hidden items-center gap-2 pr-8 text-xs font-medium sm:flex">
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  currentStep === 'upload'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t('step1')}
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  currentStep === 'preview'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t('step2', { count: validCount })}
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  currentStep === 'processing'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t('step3')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:hidden">
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-[11px] font-semibold"
              >
                {currentStep === 'upload'
                  ? t('mobileStep1')
                  : currentStep === 'preview'
                    ? t('mobileStep2', { count: validCount })
                    : t('mobileStep3')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {currentStep === 'upload' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="border-primary/20 bg-primary/5 flex flex-col justify-between gap-3.5 rounded-xl border p-3.5 sm:p-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3">
                  <IconInfoCircle className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div className="text-xs">
                    <p className="text-foreground font-semibold">
                      {t('bannerTitle')}
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {t('bannerDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <BulkImportGuideDialog />

                  {/* Dropdown Menu ตัวเลือกแม่แบบ Template ครบ 4 ประเภท */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-background w-full justify-center gap-1.5 text-xs shadow-sm sm:w-auto"
                      >
                        <IconDownload className="h-3.5 w-3.5" />
                        {t('downloadTemplateBtn')}
                        <IconChevronDown className="h-3 w-3 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 text-xs">
                      <DropdownMenuLabel className="text-muted-foreground text-[11px] font-semibold">
                        {t('selectTemplateType')}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('ALL')}
                        className="cursor-pointer gap-2"
                      >
                        <IconFileSpreadsheet className="size-4" />
                        {t('templateAll')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('PHYSICAL')}
                        className="cursor-pointer gap-2"
                      >
                        <IconBox className="size-4" />
                        {t('templatePhysical')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('DIGITAL_LINK')}
                        className="cursor-pointer gap-2"
                      >
                        <IconDeviceDesktop className="size-4" />
                        {t('templateDigitalLink')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('DIGITAL_ITEM')}
                        className="cursor-pointer gap-2"
                      >
                        <IconKey className="size-4" />
                        {t('templateDigitalItem')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDownloadTemplate('DIGITAL_SERVICE')
                        }
                        className="cursor-pointer gap-2"
                      >
                        <IconTruckDelivery className="size-4" />
                        {t('templateDigitalService')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadTemplate('AFFILIATE_LINK')}
                        className="cursor-pointer gap-2"
                      >
                        <IconExternalLink className="size-4" />
                        {t('templateAffiliate')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {branchOptions.length > 0 && (
                <div className="bg-muted/20 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
                  <div>
                    <p className="text-foreground text-xs font-semibold">
                      {t('targetBranch')}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {t('selectBranchFirst')}
                    </p>
                  </div>
                  <div className="w-full sm:w-64">
                    <Select
                      value={activeBranchId}
                      onValueChange={setSelectedBranchId}
                    >
                      <SelectTrigger className="bg-background h-9 text-xs">
                        <SelectValue
                          placeholder={t('targetBranchPlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {branchOptions.map((b) => (
                          <SelectItem
                            key={b.id}
                            value={b.id}
                            className="text-xs"
                          >
                            {b.name} {b.isMain ? `(${t('mainBranch')})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Tabs
                value={inputTab}
                onValueChange={(v) => setInputTab(v as 'file' | 'paste')}
              >
                <TabsList className="mx-auto grid w-full max-w-sm grid-cols-2">
                  <TabsTrigger value="file" className="gap-1.5 text-xs">
                    <IconFileUpload className="size-4" /> {t('tabUpload')}
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="gap-1.5 text-xs">
                    <IconUpload className="size-4" /> {t('tabPaste')}
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
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 sm:p-10 ${
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
                    <div className="bg-background mb-2.5 rounded-full border p-3 shadow-sm sm:mb-3 sm:p-4">
                      <IconFileUpload className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <p className="text-foreground text-xs font-semibold sm:text-sm">
                      {t('dropzoneTitle')}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[11px] sm:text-xs">
                      {t('dropzoneHint')}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="paste" className="mt-4 space-y-3">
                  <Textarea
                    rows={6}
                    placeholder={
                      'Title,ProductType,VariantTitle,SKU,Price,CostPrice,CategorySlug,InitialStock,WeightKg,DigitalUrl,DigitalItemContent,PointsAmount,DiscountType,DiscountAmount\nเสื้อยืดแขนสั้น,PHYSICAL,Free Size,TSHIRT-01,250,100,apparel,50,0.25,,,,PERCENTAGE,10'
                    }
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="text-xs leading-relaxed"
                  />
                  <div className="text-muted-foreground flex flex-col items-start justify-between gap-2.5 text-xs sm:flex-row sm:items-center">
                    <span className="text-[11px] sm:text-xs">
                      {t('pasteHeaderHint')}
                    </span>
                    <Button
                      size="sm"
                      onClick={handlePasteAnalyze}
                      disabled={!rawText.trim()}
                      className="w-full sm:w-auto"
                    >
                      {t('analyzeBtn')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              {branchOptions.length > 0 && (
                <div className="bg-muted/20 flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5 sm:py-2.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-foreground font-semibold">
                      {t('targetBranch')}:
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      ({t('selectBranchFirst')})
                    </span>
                  </div>
                  <div className="w-full sm:w-60">
                    <Select
                      value={activeBranchId}
                      onValueChange={setSelectedBranchId}
                    >
                      <SelectTrigger className="bg-background h-8 text-xs">
                        <SelectValue
                          placeholder={t('targetBranchPlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {branchOptions.map((b) => (
                          <SelectItem
                            key={b.id}
                            value={b.id}
                            className="text-xs"
                          >
                            {b.name} {b.isMain ? `(${t('mainBranch')})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <StatsCard
                  title={t('statsTotal')}
                  value={parsedRows.length}
                  icon={IconFileSpreadsheet}
                  valueClassName="text-lg sm:text-2xl font-bold"
                  onClick={() => setFilterMode('all')}
                  className={cn(
                    'p-2.5 transition-all duration-200 sm:p-4',
                    filterMode === 'all'
                      ? 'border-primary ring-primary/25 bg-primary/5 shadow-sm ring-2'
                      : 'hover:border-primary/40 opacity-85 hover:opacity-100',
                  )}
                />
                <StatsCard
                  title={t('statsValid')}
                  value={validCount}
                  icon={IconCheck}
                  valueClassName="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400"
                  onClick={() => setFilterMode('valid')}
                  className={cn(
                    'p-2.5 transition-all duration-200 sm:p-4',
                    filterMode === 'valid'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/25'
                      : 'opacity-85 hover:border-emerald-500/40 hover:opacity-100',
                  )}
                />
                <StatsCard
                  title={t('statsErrors')}
                  value={errorCount}
                  icon={IconAlertTriangle}
                  valueClassName={cn(
                    'text-lg sm:text-2xl font-bold',
                    errorCount > 0
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  )}
                  onClick={() => setFilterMode('errors')}
                  className={cn(
                    'p-2.5 transition-all duration-200 sm:p-4',
                    filterMode === 'errors'
                      ? 'border-destructive ring-destructive/25 bg-destructive/10 shadow-sm ring-2'
                      : 'hover:border-destructive/40 opacity-85 hover:opacity-100',
                  )}
                />
              </div>
              <div className="bg-card overflow-hidden rounded-xl border">
                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                    <thead className="bg-muted/60 sticky top-0 border-b backdrop-blur-sm">
                      <tr>
                        <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colRow')}
                        </th>
                        <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colTitle')}
                        </th>
                        <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colSku')}
                        </th>
                        <th className="text-muted-foreground p-2 text-right font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colPrice')}
                        </th>
                        <th className="text-muted-foreground p-2 text-right font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colCost')}
                        </th>
                        <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colCategory')}
                        </th>
                        <th className="text-muted-foreground p-2 text-center font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colStock')}
                        </th>
                        <th className="text-muted-foreground p-2 text-center font-semibold whitespace-nowrap sm:p-2.5">
                          {t('colStatus')}
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
                            {t('emptyFilteredRows')}
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
                            <td className="text-muted-foreground p-2 whitespace-nowrap sm:p-2.5">
                              #{row.index}
                            </td>
                            <td className="max-w-45 truncate p-2 font-medium sm:p-2.5">
                              {row.title || '—'}
                            </td>
                            <td className="text-muted-foreground p-2 whitespace-nowrap sm:p-2.5">
                              {row.sku || '—'}
                            </td>
                            <td className="p-2 text-right font-medium whitespace-nowrap sm:p-2.5">
                              ฿{row.price.toLocaleString()}
                            </td>
                            <td className="text-muted-foreground p-2 text-right whitespace-nowrap sm:p-2.5">
                              ฿{row.costPrice?.toLocaleString() || '0'}
                            </td>
                            <td className="p-2 whitespace-nowrap sm:p-2.5">
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
                            <td className="p-2 text-center font-semibold whitespace-nowrap sm:p-2.5">
                              {row.initialStock ?? 0}
                            </td>
                            <td className="p-2 text-center whitespace-nowrap sm:p-2.5">
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
                                  <IconCheck className="h-3 w-3" />{' '}
                                  {t('statusValid')}
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
                  {t('processingTitle')}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {t('processingDesc')}
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Progress value={importProgress} className="h-2" />
                <span className="text-muted-foreground text-xs">
                  {importProgress}%
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="bg-muted/10 flex flex-col-reverse gap-2.5 border-t p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          {currentStep === 'preview' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-xs sm:w-auto"
                onClick={handleFullReset}
              >
                <IconRefresh className="h-3.5 w-3.5" /> {t('resetBtn')}
              </Button>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  onClick={() => onOpenChange(false)}
                >
                  {t('cancelBtn')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={validCount === 0 || bulkImportMutation.isPending}
                  className="flex-1 gap-1.5 whitespace-nowrap shadow-sm sm:flex-initial"
                >
                  <IconUpload className="size-4" />
                  <span className="sm:hidden">
                    {t('confirmBtnShort', { count: validCount })}
                  </span>
                  <span className="hidden sm:inline">
                    {t('confirmBtn', { count: validCount })}
                  </span>
                </Button>
              </div>
            </>
          ) : currentStep === 'upload' ? (
            <div className="flex w-full flex-col-reverse items-center justify-between gap-2.5 sm:flex-row">
              <span className="text-muted-foreground text-center text-xs sm:text-left">
                {t('limitHint')}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                {t('closeBtn')}
              </Button>
            </div>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
