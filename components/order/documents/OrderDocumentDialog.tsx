'use client'

import React, { useState } from 'react'
import {
  IconCheck,
  IconCopy,
  IconDeviceFloppy,
  IconEdit,
  IconFileInvoice,
  IconFileText,
  IconPackage,
  IconPaperclip,
  IconPrinter,
  IconReceipt,
  IconReceiptTax,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { GetOrdersItem } from '@/actions/sales/order/actions'
import { useUpdateOrderTaxInfo } from '@/actions/sales/order/hooks'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatCurrency } from '@/utils/formatting/number'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DeliveryShippingDocument } from './DeliveryShippingDocument'
import { InvoiceBillDocument } from './InvoiceBillDocument'
import { PickingPackingDocument } from './PickingPackingDocument'
import { ReceiptDocument } from './ReceiptDocument'
import { TaxInvoiceAbbrDocument } from './TaxInvoiceAbbrDocument'
import { TaxInvoiceFullDocument } from './TaxInvoiceFullDocument'
import { DocumentOptions, DocumentType } from './types'

interface OrderDocumentDialogProps {
  order: GetOrdersItem
  trigger?: React.ReactNode
  defaultDocType?: DocumentType
}

export function OrderDocumentDialog({
  order,
  trigger,
  defaultDocType = 'RECEIPT',
}: OrderDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [docType, setDocType] = useState<DocumentType>(
    order.isTaxInvoiceRequested ? 'TAX_INVOICE_FULL' : defaultDocType,
  )

  // Document customizer options
  const [options, setOptions] = useState<DocumentOptions>({
    isCopy: false,
    paperSize: docType === 'TAX_INVOICE_ABBR' ? 'SLIP_80MM' : 'A4',
    showLogo: true,
    showSignatures: true,
    customNote: '',
  })

  // Tax info edit mode
  const [isEditingTax, setIsEditingTax] = useState(false)
  const [taxName, setTaxName] = useState(order.taxName || '')
  const [taxId, setTaxId] = useState(order.taxId || '')
  const [taxBranchCode, setTaxBranchCode] = useState(order.taxBranchCode || 'สำนักงานใหญ่')
  const [taxAddress, setTaxAddress] = useState(order.taxAddress || '')

  const updateTaxMutation = useUpdateOrderTaxInfo()
  const { copied, copy } = useCopyToClipboard()

  // Handle document type change
  const handleSelectDocType = (type: DocumentType) => {
    setDocType(type)
    setOptions((prev) => ({
      ...prev,
      paperSize: type === 'TAX_INVOICE_ABBR' ? 'SLIP_80MM' : 'A4',
    }))
  }

  // Handle save tax info
  const handleSaveTaxInfo = () => {
    updateTaxMutation.mutate(
      {
        id: order.id,
        input: {
          isTaxInvoiceRequested: true,
          taxName,
          taxId,
          taxBranchCode,
          taxAddress,
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('บันทึกข้อมูลใบกำกับภาษีเรียบร้อยแล้ว')
            setIsEditingTax(false)
          } else {
            toast.error(res.message || 'บันทึกข้อมูลไม่สำเร็จ')
          }
        },
        onError: () => {
          toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        },
      },
    )
  }

  // Handle copy text summary
  const handleCopySummary = () => {
    const summary = [
      `คำสั่งซื้อ #${order.orderNumber}`,
      `ยอดรวมทั้งสิ้น: ${formatCurrency(Number(order.totalAmount))}`,
      `สถานะ: ${order.status}`,
      `วันที่: ${new Date(order.createdAt).toLocaleDateString('th-TH')}`,
      `รายการ:`,
      ...order.items.map(
        (it) => `- ${it.title} (x${it.quantity}) ราคา ${formatCurrency(Number(it.price))}`,
      ),
      order.trackingNumber ? `เลขพัสดุ: ${order.trackingNumber}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    copy(summary)
    toast.success('คัดลอกสรุปคำสั่งซื้อแล้ว')
  }

  // Handle direct print
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 hover:bg-neutral-100"
            title="พิมพ์เอกสารคำสั่งซื้อ"
          >
            <IconPrinter size={15} />
            <span className="hidden sm:inline">พิมพ์เอกสาร</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-5xl! w-[95vw] h-[92vh] max-h-[92vh] p-0 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b flex items-center justify-between bg-neutral-50/70">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <IconFileInvoice className="size-5 text-primary" />
              พิมพ์เอกสารคำสั่งซื้อ #{order.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              เลือกประเภทเอกสารที่ต้องการดูตัวอย่างหรือสั่งพิมพ์ตามมาตรฐานร้านค้า
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="text-xs h-8"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              <span className="hidden sm:inline">คัดลอกสรุป</span>
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 bg-neutral-900 text-white hover:bg-neutral-800 gap-1.5 shadow-sm"
            >
              <IconPrinter size={15} />
              <span>พิมพ์เอกสาร (Print)</span>
            </Button>
          </div>
        </div>

        {/* Document Tabs Selector */}
        <div className="px-6 py-2 border-b bg-white flex flex-wrap gap-1.5 overflow-x-auto">
          <Button
            variant={docType === 'RECEIPT' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectDocType('RECEIPT')}
            className="text-xs h-8 gap-1.5 rounded-full"
          >
            <IconReceipt size={14} />
            <span>ใบเสร็จรับเงิน (Receipt)</span>
          </Button>

          <Button
            variant={docType === 'TAX_INVOICE_FULL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectDocType('TAX_INVOICE_FULL')}
            className="text-xs h-8 gap-1.5 rounded-full"
          >
            <IconReceiptTax size={14} />
            <span>ใบกำกับภาษีเต็มรูป (ม.86/4)</span>
          </Button>

          <Button
            variant={docType === 'TAX_INVOICE_ABBR' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectDocType('TAX_INVOICE_ABBR')}
            className="text-xs h-8 gap-1.5 rounded-full"
          >
            <IconFileText size={14} />
            <span>ใบกำกับภาษีย่อ / POS Slip (ม.86/6)</span>
          </Button>

          <Button
            variant={docType === 'INVOICE_BILL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectDocType('INVOICE_BILL')}
            className="text-xs h-8 gap-1.5 rounded-full"
          >
            <IconFileInvoice size={14} />
            <span>ใบแจ้งหนี้ / ใบวางบิล</span>
          </Button>

          <Button
            variant={docType === 'DELIVERY_SHIPPING' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectDocType('DELIVERY_SHIPPING')}
            className="text-xs h-8 gap-1.5 rounded-full"
          >
            <IconPackage size={14} />
            <span>ใบส่งของ & ใบปะหน้ากล่อง</span>
          </Button>

          <Button
            variant={docType === 'PICKING_PACKING' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSelectDocType('PICKING_PACKING')}
            className="text-xs h-8 gap-1.5 rounded-full"
          >
            <IconPaperclip size={14} />
            <span>ใบจัดสินค้า (Picking List)</span>
          </Button>
        </div>

        {/* Content Body: Sidebar Settings + Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Options Sidebar */}
          <div className="w-72 shrink-0 border-r bg-neutral-50/50 p-4 overflow-y-auto space-y-4 text-xs">
            {/* Paper Size selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-800">
                ขนาดกระดาษ (Paper Format)
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant={options.paperSize === 'A4' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-7.5"
                  onClick={() =>
                    setOptions((prev) => ({ ...prev, paperSize: 'A4' }))
                  }
                >
                  กระดาษ A4
                </Button>
                <Button
                  type="button"
                  variant={
                    options.paperSize === 'SLIP_80MM' ? 'default' : 'outline'
                  }
                  size="sm"
                  className="text-xs h-7.5"
                  onClick={() =>
                    setOptions((prev) => ({ ...prev, paperSize: 'SLIP_80MM' }))
                  }
                >
                  สลิป 80mm
                </Button>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">ระบุเป็นสำเนา (Copy)</span>
                <Switch
                  checked={options.isCopy}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, isCopy: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-700">แสดงโลโก้ร้านค้า</span>
                <Switch
                  checked={options.showLogo}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, showLogo: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-700">แสดงช่องลงนาม</span>
                <Switch
                  checked={options.showSignatures}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, showSignatures: checked }))
                  }
                />
              </div>
            </div>

            {/* Custom Note input */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="text-xs font-semibold text-neutral-800">
                หมายเหตุเพิ่มเติมบนเอกสาร
              </Label>
              <Textarea
                placeholder="เช่น เงื่อนไขการเปลี่ยนคืน หรือข้อความพิเศษ..."
                value={options.customNote}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, customNote: e.target.value }))
                }
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            {/* Tax Info Quick Edit */}
            {(docType === 'TAX_INVOICE_FULL' || order.isTaxInvoiceRequested) && (
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">
                    ข้อมูลใบกำกับภาษี
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-primary"
                    onClick={() => setIsEditingTax(!isEditingTax)}
                  >
                    <IconEdit size={13} className="mr-1" />
                    {isEditingTax ? 'ปิด' : 'แก้ไขข้อมูล'}
                  </Button>
                </div>

                {isEditingTax ? (
                  <div className="space-y-2 p-2.5 bg-white border rounded shadow-xs">
                    <div>
                      <Label className="text-[11px]">ชื่อ/บริษัทผู้ซื้อ</Label>
                      <Input
                        value={taxName}
                        onChange={(e) => setTaxName(e.target.value)}
                        placeholder="ชื่อบุคคล หรือ นิติบุคคล"
                        className="text-xs h-7 mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">เลขผู้เสียภาษี 13 หลัก</Label>
                      <Input
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="13 หลัก"
                        className="text-xs h-7 mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">สาขา</Label>
                      <Input
                        value={taxBranchCode}
                        onChange={(e) => setTaxBranchCode(e.target.value)}
                        placeholder="สำนักงานใหญ่ หรือ 00001"
                        className="text-xs h-7 mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">ที่อยู่จดทะเบียน</Label>
                      <Textarea
                        value={taxAddress}
                        onChange={(e) => setTaxAddress(e.target.value)}
                        placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"
                        rows={2}
                        className="text-xs mt-0.5 resize-none"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveTaxInfo}
                      disabled={updateTaxMutation.isPending}
                      className="w-full text-xs h-7 gap-1"
                    >
                      {updateTaxMutation.isPending ? (
                        <Spinner className="size-3" />
                      ) : (
                        <IconDeviceFloppy size={13} />
                      )}
                      บันทึกลงออเดอร์
                    </Button>
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-600 space-y-0.5 bg-white p-2 rounded border">
                    <p className="font-semibold text-neutral-900">
                      {order.taxName || 'ยังไม่ระบุ'}
                    </p>
                    <p>เลขผู้เสียภาษี: {order.taxId || '-'}</p>
                    <p>สาขา: {order.taxBranchCode || 'สำนักงานใหญ่'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Document Preview Canvas */}
          <div className="flex-1 bg-neutral-200/70 p-6 overflow-y-auto flex justify-center items-start">
            <div
              id="printable-document"
              className={`bg-white shadow-xl rounded-sm transition-all duration-200 ${
                options.paperSize === 'SLIP_80MM'
                  ? 'w-[80mm] min-h-[140mm]'
                  : 'w-[210mm] min-h-[297mm]'
              }`}
            >
              {docType === 'RECEIPT' && (
                <ReceiptDocument order={order} options={options} />
              )}
              {docType === 'TAX_INVOICE_FULL' && (
                <TaxInvoiceFullDocument order={order} options={options} />
              )}
              {docType === 'TAX_INVOICE_ABBR' && (
                <TaxInvoiceAbbrDocument order={order} options={options} />
              )}
              {docType === 'INVOICE_BILL' && (
                <InvoiceBillDocument order={order} options={options} />
              )}
              {docType === 'DELIVERY_SHIPPING' && (
                <DeliveryShippingDocument order={order} options={options} />
              )}
              {docType === 'PICKING_PACKING' && (
                <PickingPackingDocument order={order} options={options} />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
