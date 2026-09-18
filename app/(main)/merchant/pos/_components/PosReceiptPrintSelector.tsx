'use client'

import { useTranslations } from 'next-intl'

import { OrderDocType } from '@/components/pdf/types'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconFileInvoice,
  IconPackageExport,
  IconPrinter,
  IconReceipt,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'

interface PosReceiptPrintSelectorProps {
  shouldPrintReceipt: boolean
  onShouldPrintReceiptChange: (checked: boolean) => void
  selectedDocType: OrderDocType
  onSelectDocType: (docType: OrderDocType) => void
}

export function PosReceiptPrintSelector({
  shouldPrintReceipt,
  onShouldPrintReceiptChange,
  selectedDocType,
  onSelectDocType,
}: PosReceiptPrintSelectorProps) {
  const t = useTranslations('merchant.pos.checkoutModal')

  return (
    <div className="bg-muted/30 border-border/80 space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="print-receipt-toggle"
          className="text-foreground flex cursor-pointer items-center gap-2.5 text-sm font-semibold select-none"
        >
          <Checkbox
            id="print-receipt-toggle"
            checked={shouldPrintReceipt}
            onCheckedChange={(checked) =>
              onShouldPrintReceiptChange(Boolean(checked))
            }
          />
          <div className="flex items-center gap-1.5">
            <IconPrinter className="text-primary size-4" />
            <span>{t('printReceiptImmediate')}</span>
          </div>
        </label>
      </div>

      {shouldPrintReceipt && (
        <div className="border-border/60 space-y-1.5 border-t pt-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectDocType('receipt-slip')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                selectedDocType === 'receipt-slip'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
              )}
            >
              <IconReceipt className="size-3.5" />
              <span>{t('receiptSlip')}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDocType('receipt')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                selectedDocType === 'receipt'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
              )}
            >
              <IconReceipt className="size-3.5" />
              <span>{t('receiptA4')}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDocType('tax-invoice')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                selectedDocType === 'tax-invoice'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
              )}
            >
              <IconFileInvoice className="size-3.5" />
              <span>{t('taxInvoice')}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDocType('delivery-note')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-all',
                selectedDocType === 'delivery-note'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50',
              )}
            >
              <IconPackageExport className="size-3.5" />
              <span>{t('deliveryNote')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

