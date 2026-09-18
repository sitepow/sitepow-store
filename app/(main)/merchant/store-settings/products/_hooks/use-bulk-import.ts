'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useBranchOptions } from '@/actions/hooks/branch'
import { useBulkImportProducts } from '@/actions/hooks/product'

import {
  BulkProductRow,
  downloadProductTemplate,
  parseProductCsvText,
  TemplateType,
} from '../_lib/bulk-import-csv'

export type ImportStep = 'upload' | 'preview' | 'processing'
export type FilterMode = 'all' | 'valid' | 'errors'

interface UseBulkImportParams {
  storeId: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function useBulkImport({
  storeId,
  onOpenChange,
  onSuccess,
}: UseBulkImportParams) {
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

  const processText = (text: string) => {
    const rows = parseProductCsvText(text, {
      errTitleMin: t('errTitleMin'),
      errSkuEmpty: t('errSkuEmpty'),
      errPriceNonNegative: t('errPriceNonNegative'),
      errDigitalUrlRequired: t('errDigitalUrlRequired'),
      errDigitalItemContentRequired: t('errDigitalItemContentRequired'),
    })

    if (rows.length === 0) {
      toast.error(t('fileEmpty'))
      return
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

  const handleFullReset = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setRawText('')
    setParsedRows([])
    setFilterMode('all')
    setImportProgress(0)
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

  const validCount = parsedRows.filter((r) => !r.error).length
  const errorCount = parsedRows.filter((r) => !!r.error).length

  const filteredDisplayRows = parsedRows.filter((r) => {
    if (filterMode === 'valid') return !r.error
    if (filterMode === 'errors') return !!r.error
    return true
  })

  return {
    branchOptions,
    activeBranchId,
    setSelectedBranchId,
    currentStep,
    inputTab,
    setInputTab,
    selectedFile,
    isDragging,
    setIsDragging,
    rawText,
    setRawText,
    parsedRows,
    filterMode,
    setFilterMode,
    importProgress,
    fileInputRef,
    validCount,
    errorCount,
    filteredDisplayRows,
    isSubmitting: bulkImportMutation.isPending,
    handleDownloadTemplate: downloadProductTemplate,
    handleFileChange,
    handlePasteAnalyze,
    handleConfirmImport,
    handleFullReset,
  }
}

