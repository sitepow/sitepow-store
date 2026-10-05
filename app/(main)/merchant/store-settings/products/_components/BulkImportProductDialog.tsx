'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

import {
  useBulkImportProducts,
  useProductQuota,
} from '@/actions/catalog/product/hooks'
import { PRODUCT_TYPE_TH } from '@/constants/i18n/translate'
import { ProductType } from '@/generated/prisma/enums'
import {
  ParsedProduct,
  getSampleCsvAllTypes,
  getSampleCsvDigitalItem,
  getSampleCsvDigitalLink,
  getSampleCsvDigitalService,
  getSampleCsvPhysical,
  parseProductCsv,
  triggerCsvDownload,
} from '@/lib/csv/product-csv'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconCloudUpload,
  IconDownload,
  IconFileSpreadsheet,
  IconHelpCircle,
  IconInfoCircle,
  IconLoader2,
  IconPackage,
  IconTrash,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function BulkImportProductDialog() {
  const { selectedStoreId } = useStoreFilter()
  const { data: quota } = useProductQuota(selectedStoreId)
  const bulkImportMutation = useBulkImportProducts()

  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [showGuide, setShowGuide] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isStoreSelected = selectedStoreId && selectedStoreId !== ALL_STORES
  const productCount = quota?.productCount ?? 0
  const maxProducts = quota?.maxProducts
  const isUnlimited = maxProducts === null || maxProducts === undefined
  const remainingQuota = !isUnlimited
    ? Math.max(0, maxProducts - productCount)
    : null

  const validProducts = parsedProducts.filter((p) => p.errors.length === 0)
  const invalidProducts = parsedProducts.filter((p) => p.errors.length > 0)
  const isQuotaExceeded =
    !isUnlimited && remainingQuota !== null && validProducts.length > remainingQuota

  const handleProcessFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('กรุณาเลือกไฟล์นามสกุล .csv เท่านั้น')
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content) {
        toast.error('ไม่สามารถอ่านเนื้อหาไฟล์ CSV ได้')
        return
      }

      const result = parseProductCsv(content)
      setParsedProducts(result.products)
      setParseErrors(result.errors)

      if (result.errors.length > 0) {
        toast.error(result.errors[0])
      } else if (result.products.length === 0) {
        toast.error('ไม่พบรายการสินค้าที่สามารถนำเข้าได้ในไฟล์ CSV')
      } else {
        toast.success(
          `ประมวลผลไฟล์สำเร็จ พบ ${result.products.length} สินค้า (${result.totalRows} แถว)`,
        )
      }
    }

    reader.onerror = () => {
      toast.error('เกิดข้อผิดพลาดในการอ่านไฟล์')
    }

    reader.readAsText(selectedFile, 'UTF-8')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleProcessFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleProcessFile(files[0])
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedProducts([])
    setParseErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = async () => {
    if (!isStoreSelected) {
      toast.error('กรุณาเลือกร้านค้าก่อนนำเข้า')
      return
    }

    if (validProducts.length === 0) {
      toast.error('ไม่มีรายการสินค้าที่ถูกต้องให้สามารถนำเข้าได้')
      return
    }

    if (isQuotaExceeded) {
      toast.error(
        `โควตาสินค้าไม่เพียงพอ (เพิ่มได้อีก ${remainingQuota} รายการ แต่ในไฟล์มี ${validProducts.length} รายการ)`,
      )
      return
    }

    try {
      const res = await bulkImportMutation.mutateAsync({
        storeId: selectedStoreId,
        products: validProducts,
      })

      if (res.success) {
        toast.success(res.message || 'นำเข้าสินค้าสำเร็จแล้ว')
        handleReset()
        setOpen(false)
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการนำเข้าสินค้า')
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการนำเข้าสินค้า',
      )
    }
  }

  const renderProductTypeBadge = (type: ProductType) => {
    switch (type) {
      case ProductType.PHYSICAL:
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]"
          >
            {PRODUCT_TYPE_TH[type]}
          </Badge>
        )
      case ProductType.DIGITAL_LINK:
        return (
          <Badge
            variant="outline"
            className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px]"
          >
            {PRODUCT_TYPE_TH[type]}
          </Badge>
        )
      case ProductType.DIGITAL_ITEM:
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]"
          >
            {PRODUCT_TYPE_TH[type]}
          </Badge>
        )
      case ProductType.DIGITAL_SERVICE:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px]"
          >
            {PRODUCT_TYPE_TH[type]}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <IconFileSpreadsheet className="size-4" />
          <span>นำเข้าสินค้า (CSV)</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 border-b shrink-0 bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <IconFileSpreadsheet className="size-5 text-primary" />
                นำเข้าสินค้าจำนวนมากผ่าน CSV (Bulk Import)
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                อัปโหลดไฟล์ .csv เพื่อเพิ่มสินค้าและตัวเลือกสินค้าพร้อมกันหลายรายการ
                รองรับสินค้าทุกประเภท
              </DialogDescription>
            </div>

            {/* Template Download Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-medium">
                  <IconDownload className="size-3.5" />
                  <span>ดาวน์โหลดไฟล์ตัวอย่าง CSV</span>
                  <IconChevronDown className="size-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs">
                  เลือกเทมเพลตตัวอย่าง
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    triggerCsvDownload(
                      'sitepow-products-all-types-sample.csv',
                      getSampleCsvAllTypes(),
                    )
                  }
                  className="text-xs font-semibold cursor-pointer"
                >
                  <IconFileSpreadsheet className="size-4 mr-2 text-primary" />
                  <span>รวมทุกประเภทสินค้า (All Types - แนะนำ)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    triggerCsvDownload(
                      'sitepow-products-physical-sample.csv',
                      getSampleCsvPhysical(),
                    )
                  }
                  className="text-xs cursor-pointer"
                >
                  <IconPackage className="size-4 mr-2 text-blue-500" />
                  <span>สินค้าทั่วไป (Physical)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    triggerCsvDownload(
                      'sitepow-products-digital-link-sample.csv',
                      getSampleCsvDigitalLink(),
                    )
                  }
                  className="text-xs cursor-pointer"
                >
                  <IconDownload className="size-4 mr-2 text-purple-500" />
                  <span>สินค้าดิจิทัลลิงก์ (Digital Link)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    triggerCsvDownload(
                      'sitepow-products-digital-item-sample.csv',
                      getSampleCsvDigitalItem(),
                    )
                  }
                  className="text-xs cursor-pointer"
                >
                  <IconCheck className="size-4 mr-2 text-emerald-500" />
                  <span>สินค้าคีย์/รหัส (Digital Item)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    triggerCsvDownload(
                      'sitepow-products-digital-service-sample.csv',
                      getSampleCsvDigitalService(),
                    )
                  }
                  className="text-xs cursor-pointer"
                >
                  <IconInfoCircle className="size-4 mr-2 text-amber-500" />
                  <span>บริการเติมเกม/Webhook (Digital Service)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Guide Toggle */}
          <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex w-full items-center justify-between text-xs sm:text-sm font-medium hover:text-primary transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <IconHelpCircle className="size-4 text-primary" />
                <span>คำแนะนำรูปแบบไฟล์ CSV และคอลัมน์ที่รองรับ (คลิกเพื่อดูรายละเอียด)</span>
              </div>
              <IconChevronDown
                className={`size-4 text-muted-foreground transition-transform ${showGuide ? 'rotate-180' : ''}`}
              />
            </button>

            {showGuide && (
              <div className="mt-3.5 pt-3.5 border-t space-y-3 text-xs text-muted-foreground animate-in fade-in duration-200">
                <p>
                  <strong>เคล็ดลับการจัดทำไฟล์:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>
                    <strong>หัวตาราง (Headers):</strong> สามารถใช้ชื่อภาษาอังกฤษหรือภาษาไทยได้ เช่น{' '}
                    <code>title / ชื่อสินค้า</code>, <code>category / หมวดหมู่</code>,{' '}
                    <code>price / ราคา</code>
                  </li>
                  <li>
                    <strong>สินค้าหลายตัวเลือก (Multiple Variants):</strong> หากแถวมี{' '}
                    <code>title</code> และ <code>category</code> เดียวกัน
                    ระบบจะรวมเป็น 1 สินค้าที่มีหลายตัวเลือกให้อัตโนมัติ
                  </li>
                  <li>
                    <strong>หมวดหมู่สินค้า:</strong> หากยังไม่มีหมวดหมู่ที่ระบุ
                    ระบบจะสร้างหมวดหมู่ใหม่ให้ร้านค้าคุณโดยอัตโนมัติ
                  </li>
                  <li>
                    <strong>ประเภทสินค้า (productType):</strong> รองรับ 4 ประเภท:{' '}
                    <code>PHYSICAL</code> (สินค้าจับต้องได้),{' '}
                    <code>DIGITAL_LINK</code> (ลิงก์ดาวน์โหลด),{' '}
                    <code>DIGITAL_ITEM</code> (คีย์/รหัส),{' '}
                    <code>DIGITAL_SERVICE</code> (บริการ/เติมเกม)
                  </li>
                  <li>
                    <strong>คีย์ดิจิทัล (digitalKeys):</strong> สำหรับประเภท DIGITAL_ITEM
                    สามารถใส่หลายคีย์ในช่องเดียวได้โดยคั่นด้วยเครื่องหมาย <code>|</code> เช่น{' '}
                    <code>KEY-001|KEY-002|KEY-003</code>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Upload Zone */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <IconCloudUpload className="size-6" />
              </div>
              <h4 className="text-sm font-semibold mb-1">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ CSV มาวางที่นี่
              </h4>
              <p className="text-xs text-muted-foreground">
                รองรับไฟล์นามสกุล .csv (UTF-8) ขนาดไม่เกิน 10MB
              </p>
            </div>
          )}

          {/* File Selected & Preview */}
          {file && (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <IconFileSpreadsheet className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      ขนาด: {(file.size / 1024).toFixed(1)} KB • พบสินค้า {parsedProducts.length} รายการ
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <IconTrash className="size-3.5 mr-1" />
                  เปลี่ยนไฟล์
                </Button>
              </div>

              {/* Quota & Summary Notice */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-lg border bg-card p-3">
                  <span className="text-[11px] text-muted-foreground block">
                    สินค้าทั้งหมด
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {parsedProducts.length}
                  </span>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <span className="text-[11px] text-muted-foreground block">
                    ตัวเลือกทั้งหมด (Variants)
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {parsedProducts.reduce((sum, p) => sum + p.variants.length, 0)}
                  </span>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <span className="text-[11px] text-muted-foreground block">
                    รายการที่พร้อมนำเข้า
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    {validProducts.length}
                  </span>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <span className="text-[11px] text-muted-foreground block">
                    โควตาร้านค้าคงเหลือ
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isQuotaExceeded ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {isUnlimited ? 'ไม่จำกัด' : `${remainingQuota} รายการ`}
                  </span>
                </div>
              </div>

              {/* Warnings / Errors Alert */}
              {isQuotaExceeded && (
                <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 flex items-start gap-2.5 text-xs text-destructive">
                  <IconAlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>โควตาสินค้าไม่เพียงพอ:</strong> ร้านค้าของคุณสามารถเพิ่มสินค้าได้อีก{' '}
                    {remainingQuota} รายการ แต่ในไฟล์มีสินค้าที่พร้อมนำเข้า {validProducts.length}{' '}
                    รายการ กรุณาอัปเกรดแพ็กเกจหรือลดจำนวนสินค้าในไฟล์
                  </div>
                </div>
              )}

              {invalidProducts.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <IconAlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>มีสินค้า {invalidProducts.length} รายการที่ไม่ผ่านเกณฑ์:</strong>{' '}
                    ระบบจะนำเข้าเฉพาะรายการที่ถูกต้อง ({validProducts.length} รายการ)
                    สามารถตรวจสอบข้อผิดพลาดในตารางด้านล่างได้
                  </div>
                </div>
              )}

              {/* Preview Table */}
              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-[320px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10 text-xs">
                      <TableRow>
                        <TableHead className="w-12 text-center">แถว</TableHead>
                        <TableHead>ชื่อสินค้า</TableHead>
                        <TableHead>หมวดหมู่</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>ตัวเลือก / ราคา</TableHead>
                        <TableHead>สต็อก / ข้อมูล</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {parsedProducts.map((p, idx) => {
                        const hasErrors = p.errors.length > 0
                        const hasWarnings = p.warnings.length > 0
                        const firstVariant = p.variants[0]
                        const minPrice = Math.min(...p.variants.map((v) => v.price))
                        const maxPrice = Math.max(...p.variants.map((v) => v.price))
                        const priceDisplay =
                          minPrice === maxPrice
                            ? formatCurrency(minPrice)
                            : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`

                        return (
                          <TableRow
                            key={idx}
                            className={hasErrors ? 'bg-destructive/5' : undefined}
                          >
                            <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                              {p.rowIndex}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px]">
                              <div className="truncate" title={p.title}>
                                {p.title}
                              </div>
                              {p.slug && (
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  slug: {p.slug}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="secondary" className="text-[11px] font-normal">
                                {p.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {renderProductTypeBadge(p.productType)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="font-semibold">{priceDisplay}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {p.variants.length > 1
                                  ? `${p.variants.length} ตัวเลือก`
                                  : firstVariant?.title || 'มาตรฐาน'}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                              {p.productType === ProductType.PHYSICAL && (
                                <span>
                                  สต็อก:{' '}
                                  <strong className="text-foreground">
                                    {p.variants.reduce((s, v) => s + v.stockQuantity, 0)}
                                  </strong>{' '}
                                  ชิ้น
                                </span>
                              )}
                              {p.productType === ProductType.DIGITAL_LINK && (
                                <span className="truncate max-w-[140px] block" title={firstVariant?.digitalUrl}>
                                  {firstVariant?.digitalUrl ? 'มีลิงก์ดาวน์โหลด' : 'ไม่มีลิงก์'}
                                </span>
                              )}
                              {p.productType === ProductType.DIGITAL_ITEM && (
                                <span>
                                  คีย์:{' '}
                                  <strong className="text-foreground">
                                    {p.variants.reduce((s, v) => s + v.digitalKeys.length, 0)}
                                  </strong>{' '}
                                  รายการ
                                </span>
                              )}
                              {p.productType === ProductType.DIGITAL_SERVICE && (
                                <span>ส่งผ่าน Webhook</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {hasErrors ? (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] cursor-help"
                                  title={p.errors.join(', ')}
                                >
                                  ข้อผิดพลาด
                                </Badge>
                              ) : hasWarnings ? (
                                <Badge
                                  variant="outline"
                                  className="border-amber-500/40 text-amber-600 bg-amber-500/10 text-[10px] cursor-help"
                                  title={p.warnings.join(', ')}
                                >
                                  พร้อม (มีเตือน)
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]"
                                >
                                  พร้อมนำเข้า
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground">
            {file && (
              <span>
                พร้อมนำเข้า <strong>{validProducts.length}</strong> จากทั้งหมด{' '}
                {parsedProducts.length} สินค้า
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={bulkImportMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                !file ||
                validProducts.length === 0 ||
                isQuotaExceeded ||
                bulkImportMutation.isPending
              }
              onClick={handleImport}
              className="gap-1.5"
            >
              {bulkImportMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>กำลังนำเข้าสินค้า...</span>
                </>
              ) : (
                <>
                  <IconFileSpreadsheet className="size-4" />
                  <span>ยืนยันนำเข้า ({validProducts.length} รายการ)</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
