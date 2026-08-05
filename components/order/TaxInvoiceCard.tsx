import { IconReceipt } from '@tabler/icons-react'

interface OrderTaxInvoiceCardProps {
  isRequested?: boolean
  taxName?: string | null
  taxId?: string | null
  taxBranchCode?: string | null
  taxAddress?: string | null
}

export function OrderTaxInvoiceCard({
  isRequested,
  taxName,
  taxId,
  taxBranchCode,
  taxAddress,
}: OrderTaxInvoiceCardProps) {
  if (!isRequested) return null

  return (
    <div className="space-y-1.5 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
        <IconReceipt size={15} /> ข้อมูลใบกำกับภาษี (Tax Invoice)
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div>
          <span className="text-muted-foreground">ชื่อ/บริษัท:</span>{' '}
          <span className="font-medium">{taxName || '-'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">เลขภาษี:</span>{' '}
          <span className="font-medium">{taxId || '-'}</span>
        </div>
        {taxBranchCode && (
          <div>
            <span className="text-muted-foreground">สาขา:</span>{' '}
            <span className="font-medium">{taxBranchCode}</span>
          </div>
        )}
        {taxAddress && (
          <div className="col-span-2">
            <span className="text-muted-foreground">ที่อยู่:</span>{' '}
            <span className="font-medium">{taxAddress}</span>
          </div>
        )}
      </div>
    </div>
  )
}
