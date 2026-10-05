'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IconArrowLeft,
  IconCheck,
  IconCheckbox,
  IconCopy,
  IconEdit,
  IconPrinter,
  IconSearch,
  IconShoppingCart,
} from '@tabler/icons-react'
import toast from 'react-hot-toast'
import {
  usePurchaseOrder,
  useUpdatePurchaseOrderItem,
} from '@/actions/inventory/procurement/hooks'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import {
  PurchaseOrderData,
  PurchaseOrderDocument,
} from '@/components/procurement/PurchaseOrderDocument'

interface ProcurementPageProps {
  params: Promise<{ id: string }>
}

export default function ProcurementChecklistPage({
  params,
}: ProcurementPageProps) {
  const { id } = use(params)
  const { data: rawPo, isLoading } = usePurchaseOrder(id)
  const updateItemMutation = useUpdatePurchaseOrderItem()
  const { copied, copy } = useCopyToClipboard()

  const [filter, setFilter] = useState<'ALL' | 'UNPURCHASED' | 'PURCHASED'>('ALL')
  const [search, setSearch] = useState('')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const [editingItem, setEditingItem] = useState<{
    id: string
    title: string
    quantity: number
    unit: string
    purchasedQty: number
    actualCostPrice: number
    note: string
  } | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
        <Spinner className="size-8 text-primary mb-3" />
        <p className="text-sm text-neutral-600 font-medium">กำลังโหลดรายการสั่งซื้อ...</p>
      </div>
    )
  }

  if (!rawPo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 text-center">
        <IconShoppingCart className="size-16 text-neutral-400 mb-3" />
        <h1 className="text-lg font-bold text-neutral-800">ไม่พบรายการสั่งซื้อนี้</h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-sm">
          ลิงก์รายการสั่งซื้ออาจไม่ถูกต้อง หรือถูกลบออกจากระบบแล้ว
        </p>
      </div>
    )
  }

  const po = rawPo as unknown as PurchaseOrderData

  const totalItems = po.items.length
  const purchasedCount = po.items.filter((i) => i.isPurchased).length
  const percentComplete = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0

  const totalEstimatedAmount = Number(po.totalEstimatedAmount || 0)
  const totalActualAmount = Number(po.totalActualAmount || 0)

  const filteredItems = po.items.filter((item) => {
    if (filter === 'UNPURCHASED' && item.isPurchased) return false
    if (filter === 'PURCHASED' && !item.isPurchased) return false
    if (search) {
      const q = search.toLowerCase()
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchVariant = item.variantTitle?.toLowerCase().includes(q)
      const matchSku = item.sku?.toLowerCase().includes(q)
      return matchTitle || matchVariant || matchSku
    }
    return true
  })

  const handleTogglePurchased = (item: (typeof po.items)[0]) => {
    const nextState = !item.isPurchased
    updateItemMutation.mutate(
      {
        itemId: item.id,
        isPurchased: nextState,
        purchasedQty: nextState ? (item.purchasedQty || item.quantity) : 0,
        actualCostPrice:
          item.actualCostPrice !== null && item.actualCostPrice !== undefined
            ? Number(item.actualCostPrice)
            : Number(item.costPrice || 0),
      },
      {
        onSuccess: () => {
          toast.success(
            nextState ? `ซื้อแล้ว: ${item.title}` : `ยกเลิกการติ๊ก: ${item.title}`,
          )
        },
      },
    )
  }

  const handleSaveItemDetails = () => {
    if (!editingItem) return
    updateItemMutation.mutate(
      {
        itemId: editingItem.id,
        isPurchased: true,
        purchasedQty: editingItem.purchasedQty,
        actualCostPrice: editingItem.actualCostPrice,
        note: editingItem.note,
      },
      {
        onSuccess: () => {
          toast.success('บันทึกข้อมูลเรียบร้อยแล้ว')
          setEditingItem(null)
        },
      },
    )
  }

  const handleCopyLink = () => {
    copy(window.location.href)
    toast.success('คัดลอกลิงก์สำหรับแชร์แล้ว')
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 pb-16 text-neutral-900 font-sans">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/merchant/store-settings/products"
              className="text-neutral-500 hover:text-neutral-900 shrink-0 p-1"
              title="กลับหน้าสินค้า"
            >
              <IconArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold truncate leading-tight">
                  {po.title || 'รายการสั่งซื้อสินค้า'}
                </h1>
                <Badge
                  variant={
                    po.status === 'COMPLETED'
                      ? 'default'
                      : po.status === 'PARTIAL'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-[10px] shrink-0 font-normal px-2 py-0"
                >
                  {po.status === 'COMPLETED'
                    ? 'ซื้อครบแล้ว'
                    : po.status === 'PARTIAL'
                      ? 'ซื้อแล้วบางส่วน'
                      : 'รอดำเนินการ'}
                </Badge>
              </div>
              <p className="text-[11px] text-neutral-500 truncate">
                {po.store?.name} | {po.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 px-2 text-xs"
              title="คัดลอกลิงก์สำหรับเปิดบนมือถือ"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              <span className="hidden sm:inline ml-1">แชร์ลิงก์</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrintModalOpen(true)}
              className="h-8 px-2.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800"
              title="พิมพ์ใบสั่งซื้อ"
            >
              <IconPrinter size={15} />
              <span className="hidden sm:inline ml-1">พิมพ์ใบสั่งซื้อ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-xl border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-neutral-800">
              <IconShoppingCart size={18} className="text-primary" />
              ความคืบหน้าการซื้อ ({purchasedCount}/{totalItems} รายการ)
            </span>
            <span className="text-primary font-bold text-base">
              {percentComplete}%
            </span>
          </div>

          <Progress value={percentComplete} className="h-2.5 bg-neutral-100" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs text-neutral-600">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">
                แหล่งซื้อ / ซัพพลายเออร์
              </span>
              <p className="font-semibold text-neutral-900 truncate">
                {po.supplier || 'ร้านค้าทั่วไป'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">
                ผู้จัดซื้อ
              </span>
              <p className="font-semibold text-neutral-900 truncate">
                {po.buyerName || 'พนักงานจัดซื้อ'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">
                งบประมาณประมาณการ
              </span>
              <p className="font-medium text-neutral-800">
                {formatCurrency(totalEstimatedAmount)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">
                ยอดที่ซื้อจริง
              </span>
              <p className="font-bold text-emerald-700">
                {formatCurrency(totalActualAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 size-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า, SKU, ตัวเลือก..."
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>

          <div className="flex gap-1.5 shrink-0 bg-white p-1 rounded-lg border text-xs">
            <Button
              type="button"
              variant={filter === 'ALL' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter('ALL')}
            >
              ทั้งหมด ({totalItems})
            </Button>
            <Button
              type="button"
              variant={filter === 'UNPURCHASED' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter('UNPURCHASED')}
            >
              ยังไม่ซื้อ ({totalItems - purchasedCount})
            </Button>
            <Button
              type="button"
              variant={filter === 'PURCHASED' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setFilter('PURCHASED')}
            >
              ซื้อแล้ว ({purchasedCount})
            </Button>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-neutral-500 text-xs">
              <IconCheckbox className="size-10 mx-auto text-neutral-300 mb-2" />
              <p>ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const estTotal = (Number(item.costPrice) || 0) * (item.quantity || 1)
              const actualCost =
                item.actualCostPrice !== null && item.actualCostPrice !== undefined
                  ? Number(item.actualCostPrice)
                  : Number(item.costPrice || 0)
              const actualQty = item.purchasedQty || item.quantity
              const actualTotal = actualCost * actualQty

              return (
                <div
                  key={item.id || index}
                  className={`bg-white rounded-xl border p-3.5 transition-all flex items-start gap-3 shadow-xs ${
                    item.isPurchased
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'hover:border-neutral-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePurchased(item)}
                    disabled={updateItemMutation.isPending}
                    className={`size-7 rounded-lg border-2 shrink-0 mt-1 flex items-center justify-center transition-all ${
                      item.isPurchased
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-neutral-400 bg-white hover:border-neutral-700'
                    }`}
                  >
                    {item.isPurchased && <IconCheck size={18} strokeWidth={3} />}
                  </button>

                  <div className="relative size-12 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-[10px] text-neutral-400">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`font-bold text-neutral-900 leading-snug ${
                            item.isPurchased ? 'line-through text-neutral-500' : ''
                          }`}
                        >
                          {item.title}
                        </h3>
                        {item.variantTitle && (
                          <span className="inline-block text-[11px] text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded border mt-0.5">
                            {item.variantTitle}
                          </span>
                        )}
                      </div>

                      {item.isPurchased && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          ✓ ซื้อแล้ว
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-600 text-[11px] pt-0.5">
                      <span>
                        เป้าหมาย:{' '}
                        <strong className="text-neutral-900 font-bold">
                          {item.quantity} {item.unit || 'ชิ้น'}
                        </strong>
                      </span>
                      <span>
                        ราคาประมาณ:{' '}
                        <strong className="text-neutral-800">
                          {formatDecimal(item.costPrice || 0)} ฿
                        </strong>
                      </span>
                      <span>
                        รวมประมาณ:{' '}
                        <strong className="text-neutral-800">
                          {formatDecimal(estTotal)} ฿
                        </strong>
                      </span>
                    </div>

                    {item.isPurchased && (
                      <div className="bg-emerald-50 rounded-md p-1.5 border border-emerald-200 text-[11px] text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span>
                            ซื้อจริง: <strong>{actualQty} {item.unit || 'ชิ้น'}</strong> (
                            {formatDecimal(actualCost)} ฿/ชิ้น) ={' '}
                            <strong>{formatCurrency(actualTotal)}</strong>
                          </span>
                          {item.note && (
                            <p className="text-[10px] text-emerald-800 italic mt-0.5">
                              โน้ต: {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-neutral-500 hover:text-neutral-900 shrink-0 self-center"
                    onClick={() =>
                      setEditingItem({
                        id: item.id,
                        title: item.title,
                        quantity: item.quantity,
                        unit: item.unit || 'ชิ้น',
                        purchasedQty: item.purchasedQty || item.quantity,
                        actualCostPrice: Number(
                          item.actualCostPrice ?? item.costPrice ?? 0,
                        ),
                        note: item.note || '',
                      })
                    }
                    title="ระบุราคาหรือจำนวนจริงที่ซื้อได้"
                  >
                    <IconEdit size={16} />
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </main>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                ระบุข้อมูลที่ซื้อจริง: {editingItem.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">จำนวนที่ซื้อได้จริง ({editingItem.unit})</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingItem.purchasedQty}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? { ...prev, purchasedQty: Number(e.target.value) }
                          : null,
                      )
                    }
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ราคาต้นทุนจริงที่ได้ (บาท/{editingItem.unit})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editingItem.actualCostPrice}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? { ...prev, actualCostPrice: Number(e.target.value) }
                          : null,
                      )
                    }
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">หมายเหตุ (เช่น ซื้อที่ร้านไหน, เปลี่ยนยี่ห้อ)</Label>
                <Input
                  value={editingItem.note}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, note: e.target.value } : null,
                    )
                  }
                  placeholder="เช่น ซื้อได้ที่ร้านเจ๊พร, ขาด 2 ชิ้น"
                  className="text-xs h-8"
                />
              </div>

              <div className="p-2.5 bg-neutral-50 rounded border text-xs flex justify-between font-semibold">
                <span>ยอดเงินจริงรวมรายการนี้:</span>
                <span className="text-emerald-700 font-bold">
                  {formatCurrency(
                    editingItem.purchasedQty * editingItem.actualCostPrice,
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  className="text-xs h-8"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveItemDetails}
                  disabled={updateItemMutation.isPending}
                  className="text-xs h-8 bg-neutral-900 text-white"
                >
                  {updateItemMutation.isPending ? <Spinner className="size-3" /> : null}
                  บันทึกข้อมูลและติ๊กซื้อแล้ว
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isPrintModalOpen && (
        <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
          <DialogContent className="max-w-4xl! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b flex items-center justify-between bg-neutral-50">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <IconPrinter className="size-5 text-primary" />
                  พิมพ์ใบสั่งซื้อสินค้า #{po.orderNumber}
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
                <PurchaseOrderDocument po={po} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

