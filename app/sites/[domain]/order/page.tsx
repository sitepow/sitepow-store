'use client'

import { useState } from 'react'

import { getLabel } from '@/constants/translate'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import { IconPackage } from '@tabler/icons-react'
import { Calendar, CreditCard, Eye, Truck, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DashboardHeader } from '../_components/DashboardHeader'
import { StorePagination } from '../_components/Pagination'
import { StoreLayout } from '../_components/layout/Layout'

const mockOrders = [
  {
    id: 'clv_849201jsh001',
    orderNumber: 'SP-20260508-A7B2',
    customerName: 'ศรันย์ วงศ์ตะวัน',
    guestName: null,
    guestEmail: null,
    totalAmount: 2450.5,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.QR_PROMPTPAY,
    isTaxInvoiceRequested: false,
    createdAt: '2026-05-08 15:30:45',
    itemsCount: 2,
    items: ['เสื้อยืด Oversize สีดำ (L)', 'กางเกงยีนส์ขากระบอก'],
  },
  {
    id: 'clv_849202ksh002',
    orderNumber: 'SP-20260508-C9D4',
    customerName: null,
    guestName: 'K. Jiraporn (Guest)',
    guestEmail: 'jiraporn.s@gmail.com',
    totalAmount: 589.0,
    status: OrderStatus.PAID,
    paymentMethod: PaymentMethod.TRANSFER,
    isTaxInvoiceRequested: true,
    createdAt: '2026-05-08 14:12:10',
    itemsCount: 1,
    items: ['กระเป๋าผ้า Canvas ลายทาง'],
  },
  {
    id: 'clv_849203lsh003',
    orderNumber: 'SP-20260507-F1E9',
    customerName: 'ณัฐพงษ์ จันทรวิจิตร',
    guestName: null,
    guestEmail: null,
    totalAmount: 12500.75,
    status: OrderStatus.SHIPPED,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    isTaxInvoiceRequested: false,
    createdAt: '2026-05-07 10:05:32',
    itemsCount: 12,
    items: ['ชุดเซ็ตสกินแคร์ Premium A', 'ครีมกันแดด SPF50', 'มอยเจอร์ไรเซอร์'],
  },
  {
    id: 'clv_849204msh004',
    orderNumber: 'SP-20260507-Z3X1',
    customerName: 'ธัญญาพร รัตนโกสินทร์',
    guestName: null,
    guestEmail: null,
    totalAmount: 940.0,
    status: OrderStatus.COMPLETED,
    paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    isTaxInvoiceRequested: false,
    createdAt: '2026-05-07 09:20:15',
    itemsCount: 3,
    items: [
      'หมวกแก๊ปสีเบจ',
      'ถุงเท้าคาร์บอน (แพ็ค 3 คู่)',
      'สายรัดข้อมือออกกำลังกาย',
    ],
  },
  {
    id: 'clv_849205nsh005',
    orderNumber: 'SP-20260506-Q8W0',
    customerName: 'อานนท์ ภาคภูมิ',
    guestName: null,
    guestEmail: null,
    totalAmount: 320.0,
    status: OrderStatus.CANCELLED,
    paymentMethod: PaymentMethod.TRANSFER,
    isTaxInvoiceRequested: false,
    createdAt: '2026-05-06 18:45:00',
    itemsCount: 1,
    items: ['เคสมือถือ Silicone (Clear)'],
  },
  {
    id: 'clv_849206osh006',
    orderNumber: 'SP-20260506-K2L5',
    customerName: null,
    guestName: 'คุณสมชาย (Walk-in)',
    guestEmail: 'guest_678@hotmail.com',
    totalAmount: 4500.25,
    status: OrderStatus.PAID,
    paymentMethod: PaymentMethod.QR_PROMPTPAY,
    isTaxInvoiceRequested: true,
    createdAt: '2026-05-06 11:30:12',
    itemsCount: 5,
    items: ['เมาส์ไร้สาย Gaming', 'แผ่นรองเมาส์ XL', 'หูฟัง Bluetooth'],
  },
  {
    id: 'clv_849207psh007',
    orderNumber: 'SP-20260505-V4M3',
    customerName: 'Preeya Srisawat',
    guestName: null,
    guestEmail: null,
    totalAmount: 159.0,
    status: OrderStatus.SHIPPED,
    paymentMethod: PaymentMethod.TRANSFER,
    isTaxInvoiceRequested: false,
    createdAt: '2026-05-05 22:10:05',
    itemsCount: 1,
    items: ['พวงกุญแจตุ๊กตาลิขสิทธิ์'],
  },
]

export default function StoreOrderPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const getStatusBadge = (status: OrderStatus) => {
    const label = getLabel.orderStatus(status)

    switch (status) {
      case OrderStatus.PENDING:
        return <Badge variant="outline">{label}</Badge>
      case OrderStatus.PAID:
        return <Badge variant="outline">{label}</Badge>
      case OrderStatus.SHIPPED:
        return <Badge variant="outline">{label}</Badge>
      case OrderStatus.COMPLETED:
        return <Badge variant="outline">{label}</Badge>
      case OrderStatus.CANCELLED:
        return <Badge variant="outline">{label}</Badge>
      default:
        return <Badge variant="outline">{label}</Badge>
    }
  }

  const filteredOrders =
    activeTab === 'ALL'
      ? mockOrders
      : mockOrders.filter((order) => order.status === activeTab)

  return (
    <StoreLayout>
      <div className="space-y-6 p-6">
        <DashboardHeader
          title="ออเดอร์ร้านค้า"
          description="จัดการและติดตามสถานะคำสั่งซื้อทั้งหมดในระบบ"
        />

        <Tabs
          defaultValue="ALL"
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="bg-muted no-scrollbar flex h-auto w-full justify-start overflow-x-auto overflow-y-hidden p-1 sm:w-fit">
            <TabsTrigger
              value="ALL"
              className="shrink-0 px-4 text-xs sm:text-sm"
            >
              ทั้งหมด
            </TabsTrigger>

            {Object.values(OrderStatus).map((status) => (
              <TabsTrigger
                key={status}
                value={status}
                className="shrink-0 px-4 text-xs sm:text-sm"
              >
                {getLabel.orderStatus(status)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-card text-muted-foreground flex flex-col items-center justify-center rounded-lg border py-12 text-center">
                <p>ไม่พบรายการออเดอร์ในสถานะนี้</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="i flex flex-wrap justify-between gap-2">
                        <CardTitle className="text-base font-semibold">
                          <div className="flex items-center gap-2">
                            <IconPackage className="text-primary" />
                            {order.orderNumber}
                          </div>
                        </CardTitle>
                        {getStatusBadge(order.status as OrderStatus)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground size-4 shrink-0" />
                        <span className="truncate font-medium">
                          {order.customerName ||
                            order.guestName ||
                            'ไม่ระบุชื่อ'}
                        </span>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="size-4 shrink-0" />
                        <span>{order.createdAt}</span>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-2">
                        <CreditCard className="size-4 shrink-0" />
                        <span>
                          {getLabel.paymentMethod(
                            order.paymentMethod as PaymentMethod,
                          )}
                        </span>
                      </div>

                      <div className="bg-muted/30 rounded-md p-2">
                        <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wider uppercase">
                          รายการสินค้า
                        </p>
                        <p className="text-foreground text-xs">
                          {order.items?.join(', ')}
                          {order.itemsCount > (order.items?.length || 0) &&
                            ` และอื่นๆ อีก ${order.itemsCount - (order.items?.length || 0)} รายการ`}
                        </p>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-muted-foreground text-xs">
                          จำนวน {order.itemsCount} รายการ
                        </span>
                        <div className="text-right">
                          <span className="text-muted-foreground block text-xs">
                            ยอดรวมสุทธิ
                          </span>
                          <span className="text-foreground text-lg font-bold">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/20 flex flex-wrap gap-2 border-t pt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="size-4" /> ดูรายละเอียด
                      </Button>

                      {order.status === OrderStatus.PENDING && (
                        <Button size="sm" className="flex-1">
                          ยืนยันการชำระเงิน
                        </Button>
                      )}

                      {order.status === OrderStatus.PAID && (
                        <Button size="sm" className="flex-1">
                          <Truck className="size-4" /> ออกเลขพัสดุ
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <StorePagination />
      </div>
    </StoreLayout>
  )
}
