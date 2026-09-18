'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  IconBox,
  IconChevronDown,
  IconDeviceDesktop,
  IconDownload,
  IconExternalLink,
  IconFileSpreadsheet,
  IconFileUpload,
  IconInfoCircle,
  IconKey,
  IconTruckDelivery,
  IconUpload,
} from '@tabler/icons-react'

import { TemplateType } from '../_lib/bulk-import-csv'
import { BulkImportGuideDialog } from './BulkImportGuideDialog'

interface BulkImportUploadStepProps {
  branchOptions: { id: string; name: string; isMain?: boolean }[]
  activeBranchId: string
  onBranchChange: (branchId: string) => void
  inputTab: 'file' | 'paste'
  onInputTabChange: (tab: 'file' | 'paste') => void
  isDragging: boolean
  setIsDragging: (val: boolean) => void
  onFileChange: (file: File | undefined) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  rawText: string
  onRawTextChange: (text: string) => void
  onPasteAnalyze: () => void
  onDownloadTemplate: (type: TemplateType) => void
}

export function BulkImportUploadStep({
  branchOptions,
  activeBranchId,
  onBranchChange,
  inputTab,
  onInputTabChange,
  isDragging,
  setIsDragging,
  onFileChange,
  fileInputRef,
  rawText,
  onRawTextChange,
  onPasteAnalyze,
  onDownloadTemplate,
}: BulkImportUploadStepProps) {
  const t = useTranslations('merchant.products.bulkImport')

  return (
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
                onClick={() => onDownloadTemplate('ALL')}
                className="cursor-pointer gap-2"
              >
                <IconFileSpreadsheet className="size-4" />
                {t('templateAll')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDownloadTemplate('PHYSICAL')}
                className="cursor-pointer gap-2"
              >
                <IconBox className="size-4" />
                {t('templatePhysical')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadTemplate('DIGITAL_LINK')}
                className="cursor-pointer gap-2"
              >
                <IconDeviceDesktop className="size-4" />
                {t('templateDigitalLink')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadTemplate('DIGITAL_ITEM')}
                className="cursor-pointer gap-2"
              >
                <IconKey className="size-4" />
                {t('templateDigitalItem')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadTemplate('DIGITAL_SERVICE')}
                className="cursor-pointer gap-2"
              >
                <IconTruckDelivery className="size-4" />
                {t('templateDigitalService')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadTemplate('AFFILIATE_LINK')}
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
              onValueChange={onBranchChange}
            >
              <SelectTrigger className="bg-background h-9 text-xs">
                <SelectValue placeholder={t('targetBranchPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
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
        onValueChange={(v) => onInputTabChange(v as 'file' | 'paste')}
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
              onFileChange(e.dataTransfer.files?.[0])
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
              onChange={(e) => onFileChange(e.target.files?.[0])}
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
            onChange={(e) => onRawTextChange(e.target.value)}
            className="text-xs leading-relaxed"
          />
          <div className="text-muted-foreground flex flex-col items-start justify-between gap-2.5 text-xs sm:flex-row sm:items-center">
            <span className="text-[11px] sm:text-xs">
              {t('pasteHeaderHint')}
            </span>
            <Button
              size="sm"
              onClick={onPasteAnalyze}
              disabled={!rawText.trim()}
              className="w-full sm:w-auto"
            >
              {t('analyzeBtn')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

