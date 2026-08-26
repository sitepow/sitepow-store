/* eslint-disable @next/next/no-img-element */
'use client'

import {
  useResellerPayoutSummary,
  useResellerStocks,
} from '@/actions/hooks/reseller'
import { EmptyImage } from '@/app/sites/[domain]/_components/EmptyImage'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'
import {
  IconPackageExport,
  IconPackageImport,
  IconPencil,
} from '@tabler/icons-react'
import { CheckCircle2, Clock, DollarSign, TrendingUp } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'

interface ResellerStockTableProps {
  onAcceptStock?: (stock: any) => void
  onReturnStock?: (stock: any) => void
  onEditPrice?: (stock: any) => void // 1. เพิ่ม prop สำหรับรับ event การแก้ไขราคา
}

export function ResellerStockTable({
  onAcceptStock,
  onReturnStock,
  onEditPrice,
}: ResellerStockTableProps) {
  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId } = useResellerFilter()

  const { data: stocksRes, isLoading: isStocksLoading } =
    useResellerStocks(selectedAgreementId)
  const { data: summaryRes } = useResellerPayoutSummary(selectedAgreementId)

  const stocks = stocksRes?.data || []
  const summary = summaryRes?.data

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <div className="space-y-4">
      {selectedAgreementId && summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            title="ยอดขายรวมหน้าร้าน"
            value={formatCurrency(Number(summary.totalGrossSales || 0))}
            description="ยอดเงินเต็มที่รับจากลูกค้า"
            icon={DollarSign}
          />
          <StatsCard
            title="กำไรสะสมตัวแทน"
            value={formatCurrency(Number(summary.totalCommission || 0))}
            description={
              summary.commissionRate !== null &&
              summary.commissionRate !== undefined
                ? `อัตราส่วนแบ่งสัญญา ${summary.commissionRate}%`
                : 'ส่วนแบ่งตามรายการสินค้า'
            }
            icon={TrendingUp}
          />
          <StatsCard
            title="โอนเคลียร์ร้านแล้ว"
            value={formatCurrency(Number(summary.totalPaidAmount || 0))}
            description="ทุนสินค้าที่โอนคืนร้านแล้ว"
            icon={CheckCircle2}
          />
          <StatsCard
            title="ยอดค้างส่งคืนร้านค้า"
            value={formatCurrency(Number(summary.pendingPayoutAmount || 0))}
            description="ทุนสินค้าที่ต้องโอนเคลียร์"
            icon={Clock}
          />
        </div>
      )}
      <div className="rounded-md border">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สินค้า / ตัวเลือก</TableHead>
                <TableHead className="text-right">ราคาปลีก / ราคาส่ง</TableHead>
                <TableHead className="text-center">
                  การเคลื่อนไหวสต็อก
                </TableHead>
                <TableHead className="text-center">คงเหลือขาย</TableHead>
                <TableHead className="text-right">ยอดขายรวม</TableHead>
                <TableHead className="text-right">
                  ทุนเคลียร์เจ้าของร้าน
                </TableHead>
                <TableHead className="text-center">สถานะรับ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isStocksLoading ? (
                <TableLoadingRow colSpan={8} />
              ) : !selectedAgreementId ? (
                <TableEmptyRow
                  colSpan={8}
                  title="โปรดเลือกสัญญาตัวแทนเพื่อดูข้อมูลสต็อกฝากขาย"
                />
              ) : stocks.length === 0 ? (
                <TableEmptyRow
                  colSpan={8}
                  title="ยังไม่มีรายการสินค้าฝากขายในสัญญานี้"
                />
              ) : (
                stocks.map((stock) => {
                  const allocated = stock.allocatedQuantity || 0
                  const accepted = stock.acceptedQuantity || 0
                  const sold = stock.soldQuantity || 0
                  const remaining = accepted - sold

                  const retailPrice = Number(stock.variant?.price || 0)
                  const customPrice = stock.customPrice
                    ? Number(stock.customPrice)
                    : retailPrice
                  const totalRevenue = sold * retailPrice
                  const merchantAmount = sold * customPrice

                  const pendingQuantity = allocated - accepted
                  const isAcceptedAll = pendingQuantity <= 0

                  const imageUrl =
                    stock.variant?.image ||
                    stock.variant?.product?.images?.find(
                      (img: any) => img.isPrimary,
                    )?.url ||
                    stock.variant?.product?.images?.[0]?.url

                  return (
                    <TableRow key={stock.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-16 shrink-0 overflow-hidden rounded border border-dashed p-0.5">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={stock.variant?.product?.title || ''}
                                className="size-full rounded-sm object-cover"
                              />
                            ) : (
                              <EmptyImage className="size-full rounded-sm" />
                            )}
                          </div>
                          <div className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                            <p className="leading-none font-medium">
                              {stock.variant?.product?.title || '-'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {stock.variant?.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">
                          {formatCurrency(retailPrice)}
                        </p>
                        <div className="text-muted-foreground flex items-center justify-end gap-1 text-xs">
                          <span>ส่ง: {formatCurrency(customPrice)}</span>
                          {onEditPrice && (
                            <Button
                              variant="ghost"
                              size="icon-lg"
                              className="hover:bg-muted size-6"
                              title="ตั้งราคาส่งเฉพาะรายการ"
                              onClick={() => onEditPrice(stock)}
                            >
                              <IconPencil className="size-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="mx-auto flex w-36 flex-col gap-1.5">
                          <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-orange-500 transition-all"
                              style={{
                                width:
                                  allocated > 0
                                    ? `${((accepted - sold) / allocated) * 100}%`
                                    : '0%',
                              }}
                              title={`คงเหลือรับเข้า: ${accepted - sold}`}
                            />
                            <div
                              className="bg-emerald-500 transition-all"
                              style={{
                                width:
                                  allocated > 0
                                    ? `${(sold / allocated) * 100}%`
                                    : '0%',
                              }}
                              title={`ขายแล้ว: ${sold}`}
                            />
                          </div>
                          <div className="text-muted-foreground flex justify-between text-[11px]">
                            <span>ส่ง: {allocated}</span>
                            <span className="font-medium text-orange-500">
                              รับ: {accepted}
                            </span>
                            <span className="font-medium text-emerald-500">
                              ขาย: {sold}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={remaining > 0 ? 'outline' : 'secondary'}
                        >
                          {remaining} ชิ้น
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(merchantAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isAcceptedAll ? 'outline' : 'default'}>
                          {isAcceptedAll
                            ? 'รับครบแล้ว'
                            : `รอรับ (${pendingQuantity})`}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="icon-lg"
                          title="คืนสต็อกกลับให้เจ้าของร้าน"
                          disabled={allocated - sold <= 0}
                          onClick={() => onReturnStock?.(stock)}
                        >
                          <IconPackageExport />
                        </Button>
                        {!isAcceptedAll && (
                          <Button
                            variant="outline"
                            size="icon-lg"
                            title={
                              isAcceptedAll
                                ? 'รับครบแล้ว'
                                : 'กดรับสินค้าเข้าคลัง'
                            }
                            disabled={isAcceptedAll}
                            onClick={() => onAcceptStock?.(stock)}
                          >
                            <IconPackageImport />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  )
}
