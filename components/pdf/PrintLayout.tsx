'use client'

import { useEffect, useState } from 'react'

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
import { ShippingLabelDoc } from './ShippingLabelDoc'
import { TaxInvoiceDoc } from './TaxInvoiceDoc'
import { DOC_TYPES, OrderDocType } from './types'

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
  const [docType, setDocType] = useState<OrderDocType>(initialDocType)
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false)

  const docConfig = DOC_TYPES[docType] || DOC_TYPES.receipt

  useEffect(() => {
    if (autoPrint && !hasAutoPrinted) {
      const timer = setTimeout(() => {
        window.print()
        setHasAutoPrinted(true)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [autoPrint, hasAutoPrinted])

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    window.close()
  }

  const renderDocument = () => {
    switch (docType) {
      case 'receipt':
        return <ReceiptDoc order={order} />
      case 'tax-invoice':
        return <TaxInvoiceDoc order={order} />
      case 'delivery-note':
        return <DeliveryNoteDoc order={order} />
      case 'shipping-label':
        return <ShippingLabelDoc order={order} />
      case 'packing-slip':
        return <PackingSlipDoc order={order} />
      default:
        return <ReceiptDoc order={order} />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 print:bg-white print:p-0">
      <header className="no-print sticky top-0 z-50 border-b border-neutral-200 bg-white/95 shadow-xs backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setDocType('receipt')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                docType === 'receipt'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <IconReceipt size={14} />
              <span>ใบเสร็จรับเงิน</span>
            </button>
            <button
              type="button"
              onClick={() => setDocType('tax-invoice')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                docType === 'tax-invoice'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <IconFileInvoice size={14} />
              <span>ใบกำกับภาษี</span>
            </button>
            <button
              type="button"
              onClick={() => setDocType('delivery-note')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                docType === 'delivery-note'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <IconPackageExport size={14} />
              <span>ใบส่งสินค้า</span>
            </button>
            <button
              type="button"
              onClick={() => setDocType('shipping-label')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                docType === 'shipping-label'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <IconPrinter size={14} />
              <span>ใบปะหน้าพัสดุ</span>
            </button>
            <button
              type="button"
              onClick={() => setDocType('packing-slip')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                docType === 'packing-slip'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <IconFileDescription size={14} />
              <span>ใบจัดสินค้า</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-primary text-primary-foreground gap-1.5 shadow-sm"
            >
              <IconPrinter size={16} />
              <span>พิมพ์เอกสาร (Print)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="shrink-0 gap-1"
            >
              <IconX size={16} />
              <span className="hidden sm:inline">ปิดหน้าต่าง</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-8 print:p-0">
        <div
          className={`mx-auto bg-white transition-all ${
            docConfig.pageSize === 'Label'
              ? 'max-w-[120mm] rounded-lg p-3 shadow-md print:m-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none'
              : 'min-h-[297mm] max-w-[210mm] rounded-lg p-8 shadow-md sm:p-12 print:m-0 print:min-h-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none'
          }`}
        >
          {renderDocument()}
        </div>
      </main>
      <style jsx global>{`
        @media print {
          @page {
            size: ${docConfig.pageSize === 'Label' ? '100mm 150mm' : 'A4 portrait'};
            margin: ${docConfig.pageSize === 'Label' ? '4mm' : '8mm'};
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
