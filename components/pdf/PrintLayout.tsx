'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { GetOrdersItem } from '@/actions/order'
import {
  IconFileDescription,
  IconFileInvoice,
  IconPackageExport,
  IconPrinter,
  IconReceipt,
  IconX,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { DeliveryNoteDoc } from './DeliveryNoteDoc'
import { PackingSlipDoc } from './PackingSlipDoc'
import { ReceiptDoc } from './ReceiptDoc'
import { ReceiptSlipDoc } from './ReceiptSlipDoc'
import { ShippingLabelDoc } from './ShippingLabelDoc'
import { TaxInvoiceDoc } from './TaxInvoiceDoc'
import { DOC_TYPES, OrderDocType } from './types'

const DOC_COMPONENTS: Record<
  OrderDocType,
  ComponentType<{ order: GetOrdersItem }>
> = {
  receipt: ReceiptDoc,
  'receipt-slip': ReceiptSlipDoc,
  'tax-invoice': TaxInvoiceDoc,
  'delivery-note': DeliveryNoteDoc,
  'shipping-label': ShippingLabelDoc,
  'packing-slip': PackingSlipDoc,
}

const NAV_TABS = [
  { id: 'receipt', icon: IconReceipt },
  { id: 'receipt-slip', icon: IconReceipt },
  { id: 'tax-invoice', icon: IconFileInvoice },
  { id: 'delivery-note', icon: IconPackageExport },
  { id: 'shipping-label', icon: IconPrinter },
  { id: 'packing-slip', icon: IconFileDescription },
] as const satisfies ReadonlyArray<{
  id: OrderDocType
  icon: typeof IconReceipt
}>

const PAGE_SIZE_STYLES: Record<
  string,
  { wrapper: string; printSize: string; printMargin: string }
> = {
  Slip: {
    wrapper: 'max-w-[85mm] p-3 shadow-md',
    printSize: '80mm auto',
    printMargin: '2mm',
  },
  Label: {
    wrapper: 'max-w-[120mm] p-3 shadow-md',
    printSize: '100mm 150mm',
    printMargin: '4mm',
  },
  Default: {
    wrapper: 'min-h-[297mm] max-w-[210mm] p-8 shadow-md sm:p-12',
    printSize: 'A4 portrait',
    printMargin: '8mm',
  },
}

interface PrintLayoutProps {
  order: GetOrdersItem
  initialDocType?: OrderDocType
  autoPrint?: boolean
}

export function PrintLayout({
  order,
  initialDocType = 'receipt',
  autoPrint = true,
}: PrintLayoutProps) {
  const t = useTranslations('merchant.pdf')
  const [docType, setDocType] = useState<OrderDocType>(initialDocType)
  const hasAutoPrinted = useRef(false)

  const docConfig = DOC_TYPES[docType] || DOC_TYPES.receipt
  const pageStyle =
    PAGE_SIZE_STYLES[docConfig.pageSize] ?? PAGE_SIZE_STYLES.Default
  const ActiveDocument = DOC_COMPONENTS[docType] ?? DOC_COMPONENTS.receipt

  useEffect(() => {
    if (!autoPrint || hasAutoPrinted.current) return

    hasAutoPrinted.current = true
    const timer = setTimeout(() => {
      window.print()
    }, 600)

    return () => clearTimeout(timer)
  }, [autoPrint])

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 print:bg-white print:p-0">
      <header className="no-print sticky top-0 z-50 border-b border-neutral-200 bg-white/80 shadow-xs backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <nav
            className="flex flex-wrap items-center gap-1"
            aria-label="Document Types"
          >
            {NAV_TABS.map(({ id, icon: Icon }) => {
              const isActive = docType === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDocType(id)}
                  className={`flex items-center gap-1.5 border-b px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon size={14} />
                  <span>{t(`types.${id}` as any)}</span>
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              size="sm"
              className="bg-primary text-primary-foreground gap-1.5 shadow-sm"
            >
              <IconPrinter size={16} />
              <span>{t('print')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.close()}
              className="shrink-0 gap-1 border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              <IconX size={16} />
              <span className="hidden sm:inline">{t('closeWindow')}</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-8 print:p-0">
        <div
          className={`mx-auto bg-white text-neutral-900 transition-all print:m-0 print:min-h-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none ${pageStyle.wrapper}`}
        >
          <ActiveDocument order={order} />
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: ${pageStyle.printSize};
            margin: ${pageStyle.printMargin};
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
