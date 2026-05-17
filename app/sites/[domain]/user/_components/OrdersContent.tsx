'use client'

import { useState } from 'react'

import {
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconEye,
  IconSearch,
  IconShoppingBag,
  IconTruck,
  IconX,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface OrderItem {
  name: string
  qty: number
  price: number
}

export interface BuyerOrder {
  id: string
  storeName: string
  itemsSummary: string
  totalAmount: number
  paymentMethod: 'PROMPTPAY' | 'CASH' | string
  status: 'COMPLETED' | 'PENDING_VERIFY' | 'PROCESSING' | string
  trackingNo: string | null
  createdAt: string
  items: OrderItem[]
}

const MOCK_BUYER_ORDERS: BuyerOrder[] = [
  {
    id: 'ORD-9942',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    itemsSummary: 'เสื้อเชิ้ตโอเวอร์ไซส์ มินิมอล x 1, กางเกงสแล็ค x 1',
    totalAmount: 490,
    paymentMethod: 'PROMPTPAY',
    status: 'COMPLETED',
    trackingNo: 'TH123456789EX',
    createdAt: '2026-05-17 10:14',
    items: [
      { name: 'เสื้อเชิ้ตโอเวอร์ไซส์ มินิมอล', qty: 1, price: 290 },
      { name: 'กางเกงสแล็คสไตล์เกาหลี', qty: 1, price: 200 },
    ],
  },
  {
    id: 'ORD-9811',
    storeName: 'Gadget & IT Accessories',
    itemsSummary: 'เคสหนังแท้ iPhone 15 x 1',
    totalAmount: 850,
    paymentMethod: 'PROMPTPAY',
    status: 'PENDING_VERIFY',
    trackingNo: null,
    createdAt: '2026-05-16 18:22',
    items: [{ name: 'เคสหนังแท้ iPhone 15', qty: 1, price: 850 }],
  },
  {
    id: 'ORD-9530',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    itemsSummary: 'หมวกบักเก็ตผ้าฝ้าย x 1',
    totalAmount: 150,
    paymentMethod: 'CASH',
    status: 'PROCESSING',
    trackingNo: 'KEX99887711',
    createdAt: '2026-05-12 14:05',
    items: [{ name: 'หมวกบักเก็ตผ้าฝ้าย', qty: 1, price: 150 }],
  },
]

export function OrdersContent() {
  const [orders, setOrders] = useState(MOCK_BUYER_ORDERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null)

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFY':
        return (
          <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
            <IconClock size={12} /> รอตรวจสอบสลิป
          </Badge>
        )
      case 'PROCESSING':
        return (
          <Badge className="gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
            <IconTruck size={12} /> กำลังจัดเตรียม/จัดส่ง
          </Badge>
        )
      case 'COMPLETED':
        return (
          <Badge className="gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
            <IconCircleCheck size={12} /> สำเร็จแล้ว
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <IconX size={12} /> ยกเลิก
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconShoppingBag}
        title="ประวัติการสั่งซื้อของคุณ"
        description="ติดตามสถานะคำสั่งซื้อ ตรวจสอบเลขพัสดุ และดูประวัติการช้อปปิ้งย้อนหลัง"
      />

      <div className="relative max-w-md">
        <IconSearch
          className="text-muted-foreground absolute top-2.5 left-3"
          size={16}
        />
        <Input
          placeholder="ค้นหาด้วยรหัสคำสั่งซื้อ หรือชื่อร้านค้า..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      <div className="bg-background overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow>
              <TableHead className="w-30">รหัสสั่งซื้อ</TableHead>
              <TableHead>ร้านค้า</TableHead>
              <TableHead className="max-w-62.5">รายการสินค้า</TableHead>
              <TableHead>ยอดสุทธิ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-35">วันที่สั่งซื้อ</TableHead>
              <TableHead className="w-20 text-right">ดูข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-12 text-center"
                >
                  ไม่พบประวัติคำสั่งซื้อของคุณ
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/10">
                  <TableCell className="text-foreground font-mono font-bold">
                    {order.id}
                  </TableCell>
                  <TableCell className="text-foreground font-semibold">
                    {order.storeName}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-62.5 truncate">
                    {order.itemsSummary}
                  </TableCell>
                  <TableCell className="text-foreground font-bold">
                    ฿{order.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {order.createdAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary h-8 w-8"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <IconEye size={16} />
                        </Button>
                      </DialogTrigger>
                      {selectedOrder && (
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-1.5 text-sm font-bold">
                              รายละเอียดคำสั่งซื้อ {selectedOrder.id}
                            </DialogTitle>
                            <DialogDescription className="font-mono text-[11px]">
                              ซื้อจาก: {selectedOrder.storeName} |{' '}
                              {selectedOrder.createdAt}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-2 text-xs">
                            <div className="bg-muted/20 space-y-2 rounded-xl border p-3">
                              <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                รายการสินค้า
                              </span>
                              {selectedOrder.items.map((item, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-foreground flex items-center justify-between"
                                >
                                  <span>
                                    {item.name}{' '}
                                    <span className="text-muted-foreground font-mono">
                                      x{item.qty}
                                    </span>
                                  </span>
                                  <span className="font-semibold">
                                    ฿{(item.price * item.qty).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              <div className="text-foreground mt-2 flex items-center justify-between border-t pt-2 text-sm font-bold">
                                <span>ยอดชำระทั้งสิ้น</span>
                                <span className="text-primary">
                                  ฿{selectedOrder.totalAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                                ข้อมูลการจัดส่ง
                              </span>
                              {selectedOrder.trackingNo ? (
                                <div className="bg-background flex items-center justify-between rounded-lg border p-2.5">
                                  <div className="space-y-0.5">
                                    <span className="text-muted-foreground block text-[10px]">
                                      เลขพัสดุ (Tracking Number)
                                    </span>
                                    <span className="text-foreground font-mono font-bold">
                                      {selectedOrder.trackingNo}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 px-2 text-[10px]"
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        selectedOrder.trackingNo!,
                                      )
                                    }
                                  >
                                    <IconCopy size={12} /> คัดลอก
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-muted-foreground bg-muted/40 rounded-lg border border-dashed p-2.5 text-[11px]">
                                  {selectedOrder.status === 'PENDING_VERIFY'
                                    ? '⏳ ระบบกำลังตรวจสอบการชำระเงินของคุณ เมื่อผ่านแล้วจะเริ่มทำการแพ็คสินค้าทันที'
                                    : '📦 ร้านค้ากำลังจัดเตรียมสินค้าเพื่อนำส่งไปรษณีย์'}
                                </p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
