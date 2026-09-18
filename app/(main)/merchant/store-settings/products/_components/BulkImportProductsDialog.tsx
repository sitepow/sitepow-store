'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconArrowRight, IconFileSpreadsheet } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'

import { BulkImportPreviewStep } from './BulkImportPreviewStep'
import { BulkImportProcessingStep } from './BulkImportProcessingStep'
import { BulkImportUploadStep } from './BulkImportUploadStep'
import { useBulkImport } from '../_hooks/use-bulk-import'

interface BulkImportProductsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onSuccess?: () => void
}

export function BulkImportProductsDialog({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: BulkImportProductsDialogProps) {
  const t = useTranslations('merchant.products.bulkImport')

  const {
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
    isSubmitting,
    handleDownloadTemplate,
    handleFileChange,
    handlePasteAnalyze,
    handleConfirmImport,
    handleFullReset,
  } = useBulkImport({
    storeId,
    onOpenChange,
    onSuccess,
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isSubmitting) return
        if (!nextOpen) {
          handleFullReset()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className={`transition-all duration-200 ${
          currentStep === 'preview'
            ? 'max-h-[92vh] max-w-4xl'
            : 'max-h-[90vh] max-w-xl'
        } flex flex-col p-0`}
      >
        <DialogHeader className="border-b px-5 py-4">
          <DialogHeaderIcon
            icon={IconFileSpreadsheet}
            title={t('modalTitle')}
            description={t('modalDescription')}
          />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {currentStep === 'upload' && (
            <BulkImportUploadStep
              branchOptions={branchOptions}
              activeBranchId={activeBranchId}
              onBranchChange={setSelectedBranchId}
              inputTab={inputTab}
              onInputTabChange={setInputTab}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef}
              rawText={rawText}
              onRawTextChange={setRawText}
              onPasteAnalyze={handlePasteAnalyze}
              onDownloadTemplate={handleDownloadTemplate}
            />
          )}

          {currentStep === 'preview' && (
            <BulkImportPreviewStep
              branchOptions={branchOptions}
              activeBranchId={activeBranchId}
              onBranchChange={setSelectedBranchId}
              parsedRows={parsedRows}
              validCount={validCount}
              errorCount={errorCount}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              filteredDisplayRows={filteredDisplayRows}
            />
          )}

          {currentStep === 'processing' && (
            <BulkImportProcessingStep importProgress={importProgress} />
          )}
        </div>

        {currentStep !== 'processing' && (
          <DialogFooter className="bg-muted/30 border-t px-5 py-3.5 sm:justify-between">
            {currentStep === 'preview' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullReset}
                disabled={isSubmitting}
              >
                {t('backToUploadBtn')}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleFullReset()
                  onOpenChange(false)
                }}
                disabled={isSubmitting}
              >
                {t('cancelBtn')}
              </Button>

              {currentStep === 'preview' && (
                <Button
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={validCount === 0 || isSubmitting}
                  className="gap-1.5"
                >
                  <IconArrowRight className="h-4 w-4" />
                  {t('confirmImportBtn', { count: validCount })}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
