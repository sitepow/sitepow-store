'use client'

import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { IconPrinter } from '@tabler/icons-react'
import QRCode from 'qrcode'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TableData {
  id: string
  tableNumber: string
  seats: number
  qrCodeToken: string
  zone?: { name: string } | null
}

interface PrintTableCardModalProps {
  isOpen: boolean
  onClose: () => void
  table: TableData | null
  storeName: string
  storeLogo?: string | null
  storeSlug?: string
  customDomain?: string | null
}

export function PrintTableCardModal({
  isOpen,
  onClose,
  table,
  storeName,
  storeLogo,
  customDomain,
}: PrintTableCardModalProps) {
  const t = useTranslations('merchant.tables')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const printRef = useRef<HTMLDivElement>(null)

  // Construct target ordering URL
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const tableUrl = table
    ? customDomain
      ? `https://${customDomain}/table/${table.qrCodeToken}`
      : `${origin}/table/${table.qrCodeToken}`
    : ''

  useEffect(() => {
    if (table && tableUrl) {
      QRCode.toDataURL(tableUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR Code:', err))
    }
  }, [table, tableUrl])

  const handlePrint = () => {
    window.print()
  }

  if (!table) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-4">
          <DialogTitle className="text-base font-semibold">
            {t('print.title', { table: table.tableNumber })}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <IconPrinter className="size-4" />
              {t('print.printButton')}
            </Button>
          </div>
        </DialogHeader>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-table-card,
            #printable-table-card * {
              visibility: visible !important;
            }
            #printable-table-card {
              position: fixed !important;
              left: 50% !important;
              top: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: 380px !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: 2px solid #334155 !important;
              page-break-inside: avoid !important;
            }
          }
        `}</style>

        {/* Printable Card Area */}
        <div className="flex justify-center bg-slate-50 p-6 dark:bg-zinc-950">
          <div
            id="printable-table-card"
            ref={printRef}
            className="flex min-h-[480px] w-full max-w-[360px] flex-col items-center justify-between rounded-3xl border-2 border-slate-800 bg-white p-6 text-center text-slate-900 shadow-xl"
          >
            {/* Store Branding */}
            <div className="flex flex-col items-center">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="mb-2 h-16 w-16 rounded-full border object-contain p-1"
                />
              ) : null}
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {storeName}
              </h2>
              {table.zone && (
                <span className="mt-0.5 text-xs font-medium text-slate-500">
                  {t('print.zonePrefix', { zone: table.zone.name })}
                </span>
              )}
            </div>

            {/* Table Number Badge */}
            <div className="my-3 rounded-full bg-slate-900 px-6 py-1.5 text-white">
              <span className="text-2xl font-black tracking-wider">
                {t('tablePrefix')} {table.tableNumber}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="my-2 rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code ${table.tableNumber}`}
                  className="h-48 w-48 object-contain sm:h-56 sm:w-56"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center text-xs text-slate-400">
                  {t('print.generatingQR')}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                {t('print.scanToOrder')}
              </p>
              <p className="text-xs text-slate-500">{t('print.noAppNeeded')}</p>
              <p className="pt-1 text-[10px] text-slate-400 select-all">
                {tableUrl}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
