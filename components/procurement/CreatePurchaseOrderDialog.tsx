'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconFileInvoice,
  IconPlus,
  IconPrinter,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { GetProductsItem } from '@/actions/catalog/product/actions'
import { useCreatePurchaseOrder } from '@/actions/inventory/procurement/hooks'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { DecimalToNumber } from '@/utils/shared/decimal'
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
import { Textarea } from '@/components/ui/textarea'
import {
  PurchaseOrderData,
  PurchaseOrderDocument,
} from './PurchaseOrderDocument'

export interface SelectedItemEntry {
  productId: string
  variantId: string
  title: string
  variantTitle?: string | null
  sku?: string | null
  image?: string | null
  quantity: number
  costPrice: number
  unit: string
}

interface CreatePurchaseOrderDialogProps {
  storeId: string
  selectedProducts: DecimalToNumber<GetProductsItem>[]
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function CreatePurchaseOrderDialog({
  storeId,
  selectedProducts,
  onSuccess,
  trigger,
}: CreatePurchaseOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('รายการสั่งซื้อสินค้า / เติมสต็อก')
  const [supplier, setSupplier] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [note, setNote] = useState('')

  const [items, setItems] = useState<SelectedItemEntry[]>([])

  const [createdPo, setCreatedPo] = useState<PurchaseOrderData | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const createMutation = useCreatePurchaseOrder()
  const { copied, copy } = useCopyToClipboard()

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const initialItems: SelectedItemEntry[] = []
      selectedProducts.forEach((product) => {
        const pImage = product.images?.[0]?.url || null
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((v) => {
            initialItems.push({
              productId: product.id,
              variantId: v.id,
              title: product.title,
              variantTitle: v.title !== 'Default Variant' && v.title !== 'ค่าเริ่มต้น' ? v.title : null,
              sku: v.sku || null,
              image: pImage,
              quantity: 1,
              costPrice: Number(v.costPrice || v.price || 0),
              unit: 'ชิ้น',
            })
          })
        } else {
          initialItems.push({
            productId: product.id,
            variantId: product.id,
            title: product.title,
            variantTitle: null,
            sku: null,
            image: pImage,
            quantity: 1,
            costPrice: 0,
            unit: 'ชิ้น',
          })
        }
      })
      setItems(initialItems)
      setCreatedPo(null)
    }
    setOpen(newOpen)
  }

  const handleUpdateItem = (
    index: number,
    field: keyof SelectedItemEntry,
    value: string | number,
  ) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('กรุณาระบุรายการสินค้าอย่างน้อย 1 รายการ')
      return
    }

    createMutation.mutate(
      {
        storeId,
        title,
        supplier,
        buyerName,
        targetDate: targetDate ? new Date(targetDate) : null,
        note,
        items,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            toast.success('สร้างใบสั่งซื้อสินค้าเรียบร้อยแล้ว')
            setCreatedPo(res.data as unknown as PurchaseOrderData)
            onSuccess?.()
          } else {
            toast.error(res.message || 'สร้างใบสั่งซื้อไม่สำเร็จ')
          }
        },
        onError: () => {
          toast.error('เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ')
        },
      },
    )
  }

  const totalEstimatedAmount = items.reduce(
    (sum, it) => sum + (Number(it.costPrice) || 0) * (it.quantity || 1),
    0,
  )

  const shareableUrl = createdPo
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/procurement/${createdPo.id}`
    : ''

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              size="sm"
              className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <IconShoppingCart size={15} />
              <span>ออกใบสั่งซื้อของ ({selectedProducts.length})</span>
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-4xl! w-[92vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between bg-neutral-50">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <IconFileInvoice className="size-5 text-primary" />
                สร้างใบสั่งซื้อสินค้า / รายการซื้อของ (Purchase Order)
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                จัดทำใบสั่งซื้อสำหรับไปซื้อของหน้าร้าน/ตลาด พร้อม QR Code และลิงก์สำหรับติ๊กรายการที่ซื้อแล้ว
              </DialogDescription>
            </div>
          </div>

          {!createdPo ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50/70 p-3.5 rounded-lg border">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold">หัวข้อเอกสาร</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น รายการสั่งซื้อของเติมสต็อกประจำสัปดาห์"
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    แหล่งซื้อ / ซัพพลายเออร์
                  </Label>
                  <Input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="เช่น ตลาดไท, แม็คโคร, สำเพ็ง"
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">ผู้จัดซื้อ</Label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="เช่น สมชาย, ฝ่ายจัดซื้อ"
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold">วันที่นัดซื้อ</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold">หมายเหตุเพิ่มเติม</Label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น เน้นวันหมดอายุอย่างน้อย 1 ปี"
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-neutral-800">
                    รายการสินค้าที่เลือก ({items.length} รายการ)
                  </Label>
                  <span className="text-xs text-neutral-500">
                    ปรับจำนวนและราคาต้นทุนโดยประมาณได้
                  </span>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-neutral-100 text-neutral-700 font-semibold border-b">
                        <th className="py-2 px-2 text-center w-12">ลำดับ</th>
                        <th className="py-2 px-2 text-center w-12">รูป</th>
                        <th className="py-2 px-3 text-left">สินค้า / ตัวเลือก</th>
                        <th className="py-2 px-2 text-center w-24">จำนวน</th>
                        <th className="py-2 px-2 text-center w-20">หน่วย</th>
                        <th className="py-2 px-3 text-right w-28">ราคาประมาณ/หน่วย</th>
                        <th className="py-2 px-3 text-right w-28">รวมประมาณ</th>
                        <th className="py-2 px-2 text-center w-12">ลบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const lineTotal =
                          (Number(item.costPrice) || 0) * (item.quantity || 1)
                        return (
                          <tr key={idx} className="border-b last:border-0 hover:bg-neutral-50">
                            <td className="py-2 px-2 text-center text-neutral-500">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              {item.image ? (
                                <div className="relative size-8 mx-auto rounded border overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="size-8 mx-auto rounded bg-neutral-100 flex items-center justify-center text-[8px] text-neutral-400">
                                  -
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <p className="font-semibold text-neutral-900">{item.title}</p>
                              {item.variantTitle && (
                                <p className="text-[11px] text-neutral-500">
                                  ตัวเลือก: {item.variantTitle}
                                </p>
                              )}
                            </td>
                            <td className="py-1 px-2 text-center">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    idx,
                                    'quantity',
                                    Math.max(1, parseInt(e.target.value) || 1),
                                  )
                                }
                                className="h-7 text-xs text-center w-18 mx-auto"
                              />
                            </td>
                            <td className="py-1 px-2 text-center">
                              <Input
                                value={item.unit}
                                onChange={(e) =>
                                  handleUpdateItem(idx, 'unit', e.target.value)
                                }
                                placeholder="ชิ้น"
                                className="h-7 text-xs text-center w-16 mx-auto"
                              />
                            </td>
                            <td className="py-1 px-3 text-right">
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                value={item.costPrice}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    idx,
                                    'costPrice',
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="h-7 text-xs text-right w-24 ml-auto"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-neutral-900">
                              {formatDecimal(lineTotal)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                                title="ลบรายการนี้"
                              >
                                <IconTrash size={15} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center bg-neutral-900 text-white p-3.5 rounded-lg">
                <span className="font-semibold text-sm">
                  งบประมาณประมาณการรวมทั้งหมด:
                </span>
                <span className="text-lg font-extrabold">
                  {formatCurrency(totalEstimatedAmount)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
              <div className="size-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <IconCheck size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900">
                  สร้างใบสั่งซื้อสินค้าเรียบร้อยแล้ว!
                </h3>
                <p className="text-xs text-neutral-500">
                  เลขที่เอกสาร: <strong className="text-neutral-900">{createdPo.orderNumber}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                <div className="border rounded-xl p-4 bg-neutral-50 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <IconExternalLink size={16} className="text-primary" />
                      เปิดดูเช็คลิสต์บนเว็บ
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      เปิดหน้าเว็บเพื่อติ๊กสินค้าที่ซื้อแล้ว ระบุราคาจริงที่ซื้อได้แบบเรียลไทม์
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button asChild size="sm" className="w-full gap-1.5 text-xs h-8">
                      <Link
                        href={`/procurement/${createdPo.id}`}
                        target="_blank"
                      >
                        <IconExternalLink size={14} />
                        เปิดหน้ารายการซื้อของ
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        copy(shareableUrl)
                        toast.success('คัดลอกลิงก์เรียบร้อยแล้ว')
                      }}
                      className="w-full gap-1.5 text-xs h-8"
                    >
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      คัดลอกลิงก์แชร์ให้คนไปซื้อ
                    </Button>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-neutral-50 space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <IconPrinter size={16} className="text-primary" />
                      พิมพ์เอกสาร / บันทึก PDF
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      มี QR Code ในตัวเอกสาร ให้พนักงานสามารถใช้มือถือสแกนเปิดเช็คลิสต์ได้ทันที
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="w-full gap-1.5 text-xs h-8 bg-white"
                  >
                    <IconPrinter size={14} />
                    ดูตัวอย่าง & พิมพ์ใบสั่งซื้อ
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-3 border-t bg-neutral-50 flex justify-end gap-2">
            {!createdPo ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="text-xs h-8"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="text-xs h-8 bg-neutral-900 text-white gap-1.5"
                >
                  {createMutation.isPending ? <Spinner className="size-3" /> : null}
                  สร้างใบสั่งซื้อสินค้า
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs h-8"
              >
                เสร็จสิ้น
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {createdPo && isPrintModalOpen && (
        <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
          <DialogContent className="max-w-4xl! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b flex items-center justify-between bg-neutral-50">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <IconPrinter className="size-5 text-primary" />
                  พิมพ์ใบสั่งซื้อสินค้า #{createdPo.orderNumber}
                </DialogTitle>
              </div>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-neutral-900 text-white hover:bg-neutral-800 gap-1.5 h-8 text-xs"
              >
                <IconPrinter size={15} />
                <span>สั่งพิมพ์ (Print)</span>
              </Button>
            </div>

            <div className="flex-1 bg-neutral-200/70 p-6 overflow-y-auto flex justify-center items-start">
              <div
                id="printable-document"
                className="bg-white shadow-xl rounded-sm w-[210mm] min-h-[297mm]"
              >
                <PurchaseOrderDocument po={createdPo} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
