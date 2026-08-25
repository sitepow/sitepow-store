/* eslint-disable @next/next/no-img-element */
'use client'

import {
  useResellerPayoutSummary,
  useResellerStocks,
} from '@/actions/hooks/reseller'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'
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

interface ResellerStockTableProps {
  onAcceptStock?: (stock: any) => void
  onTransferStock?: (stock: any) => void
  onReturnStock?: (stock: any) => void
}

export function ResellerStockTable({
  onAcceptStock,
  onTransferStock,
  onReturnStock,
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สินค้า / ตัวเลือก</TableHead>
              <TableHead className="text-right">ราคาปลีก / ทุนส่ง</TableHead>
              <TableHead className="text-right">
                จำนวน (จัดสรร / รับแล้ว / ขาย / เหลือ)
              </TableHead>
              <TableHead className="text-right">ยอดรับจากลูกค้า</TableHead>
              <TableHead className="text-right">ทุนที่ต้องโอนคืนร้าน</TableHead>
              <TableHead className="text-center">สถานะรับเข้า</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isStocksLoading ? (
              <TableLoadingRow colSpan={7} />
            ) : !selectedAgreementId ? (
              <TableEmptyRow
                colSpan={7}
                title="โปรดเลือกสัญญาตัวแทนเพื่อดูข้อมูลสต็อกฝากขาย"
              />
            ) : stocks.length === 0 ? (
              <TableEmptyRow
                colSpan={7}
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
                  stock.variant?.product?.images?.[0]?.url

                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
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
                        ปลีก: {formatCurrency(retailPrice)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        ส่ง: {formatCurrency(customPrice)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-sm">
                        <span title="จัดสรรทั้งหมด" className="font-medium">
                          {allocated}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span title="รับเข้าแล้ว" className="font-medium">
                          {accepted}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span title="ขายแล้ว" className="font-medium">
                          {sold}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <Badge variant="outline" className="ml-1">
                          เหลือ {remaining}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(merchantAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={isAcceptedAll ? 'default' : 'outline'}>
                        {isAcceptedAll
                          ? 'รับครบแล้ว'
                          : `รอรับ (${pendingQuantity})`}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1.5 text-right whitespace-nowrap">
                      {onTransferStock && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={remaining <= 0}
                          onClick={() => onTransferStock(stock)}
                        >
                          โอนต่อ
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={allocated - sold <= 0}
                        onClick={() => onReturnStock?.(stock)}
                      >
                        คืนสต็อก
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isAcceptedAll}
                        onClick={() => onAcceptStock?.(stock)}
                      >
                        {isAcceptedAll ? 'รับครบแล้ว' : 'รับสินค้า'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
