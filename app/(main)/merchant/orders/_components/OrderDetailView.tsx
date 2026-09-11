'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem, ShippingAddressSnapshot } from '@/actions/order'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatFullAddress } from '@/utils/address'
import { formatDateTime } from '@/utils/date'
import { formatNumber } from '@/utils/pricing'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import {
  IconCheck,
  IconCopy,
  IconCreditCardPay,
  IconCubeSend,
  IconEye,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconUser,
} from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { OrderItemsSummary } from '@/components/order/ItemsSummary'
import { OrderStatusBadges } from '@/components/order/StatusBadges'
import { OrderTrackingForm } from '@/components/order/TrackingForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

interface OrderDetailViewProps {
  order: GetOrdersItem
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.orders.detail')
  const tStatuses = useTranslations('merchant.orders.statuses')
  const { copied, copy } = useCopyToClipboard()
  const [open, setOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || '',
  )
  const [isEnteringTracking, setIsEnteringTracking] = useState(false)

  const updateStatusMutation = useUpdateOrderStatus()

  const handleUpdateStatus = (status: OrderStatus, tracking?: string) => {
    updateStatusMutation.mutate(
      { id: order.id, status, trackingNumber: tracking },
      {
        onSuccess: () => setIsEnteringTracking(false),
      },
    )
  }

  const handleStatusSelect = (value: string) => {
    const nextStatus = value as OrderStatus

    if (nextStatus === OrderStatus.SHIPPED && !order.trackingNumber) {
      setIsEnteringTracking(true)
      return
    }

    setIsEnteringTracking(false)
    handleUpdateStatus(nextStatus)
  }

  const handleSaveTracking = () => {
    handleUpdateStatus(OrderStatus.SHIPPED, trackingNumber)
  }

  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  const isCancelled = order.status === OrderStatus.CANCELLED
  const isPending = updateStatusMutation.isPending

  const isDirectPayment =
    order.paymentMethod === PaymentMethod.BANK_TRANSFER ||
    order.paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY

  const customerName =
    [order.customer?.firstName, order.customer?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || '-'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties} className="max-h-[85vh] gap-2.5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconReceipt}
            title={t('orderTitle', { orderNumber: order.orderNumber })}
            description={t('orderDate', {
              date: formatDateTime(order.createdAt),
            })}
          />
          <OrderStatusBadges
            status={order.status}
            paymentMethod={order.paymentMethod}
            isTaxInvoiceRequested={order.isTaxInvoiceRequested}
            paidAt={order.paidAt}
          />
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
          <span className="text-sm font-medium">{t('updateStatus')}</span>
          <Select
            value={order.status}
            disabled={isCancelled || isPending}
            onValueChange={handleStatusSelect}
          >
            <SelectTrigger className="w-44">
              {isPending ? <Spinner /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatuses(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CustomerCard
          icon={<IconUser />}
          title={t('customerInfo')}
          content={
            <>
              {t('customerName')} {customerName} <br />
              {t('email')} {order.customer?.email || '-'} <br />
              {t('phone')}{' '}
              {order.customer?.phone
                ? formatPromptPay(order.customer.phone)
                : '-'}
            </>
          }
        />
        <CustomerCard
          icon={<IconMapPin />}
          title={t('shippingAddress')}
          content={
            <>
              {t('receiverName')}{' '}
              {shippingAddr?.receiverName || shippingAddr?.name || '-'} <br />
              {t('phone')}{' '}
              {shippingAddr?.phone ? formatPromptPay(shippingAddr.phone) : '-'}
              <br />
              {t('address')} {formatFullAddress(shippingAddr) || '-'}
            </>
          }
        />
        <OrderItemsSummary order={order} />
        {isEnteringTracking && (
          <OrderTrackingForm
            trackingNumber={trackingNumber}
            isPending={isPending}
            onTrackingNumberChange={setTrackingNumber}
            onSubmit={handleSaveTracking}
          />
        )}
        {order.trackingNumber ? (
          <CustomerCard
            icon={<IconCubeSend />}
            title={t('trackingNumber')}
            content={
              <>
                {t('carrierTracking')} {order.trackingNumber} <br />
                {t('shippingMethod')} {order.shippingMethod || '-'}
              </>
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(order.trackingNumber || '')}
              >
                {copied ? (
                  <>
                    <IconCheck size={16} /> {t('copied')}
                  </>
                ) : (
                  <>
                    <IconCopy size={16} /> {t('copy')}
                  </>
                )}
              </Button>
            }
          />
        ) : order.status !== OrderStatus.CANCELLED &&
          order.status !== OrderStatus.SHIPPED ? (
          <CustomerCard
            icon={<IconCubeSend />}
            title={t('shippingStatus')}
            content={
              order.status === OrderStatus.PENDING
                ? t('pendingShipping')
                : t('processingShipping')
            }
          />
        ) : null}
        <CustomerCard
          icon={<IconPackage />}
          title={t('dimensionsWeight')}
          content={
            <>
              {t('weight')} {formatNumber(order.totalWeight || 0)} {t('kgUnit')}{' '}
              <br />
              {t('dimensions')} {formatNumber(order.width || 0)} x{' '}
              {formatNumber(order.length || 0)} x{' '}
              {formatNumber(order.height || 0)} {t('cmUnit')}
            </>
          }
        />
        {isDirectPayment && (
          <CustomerCard
            icon={<IconCreditCardPay />}
            title={t('paymentInfo')}
            content={
              <>
                {t('bank')} {order.bankAccount?.bankName || '-'} <br />
                {t('accountNumber')}{' '}
                {order.bankAccount?.accountNumber
                  ? formatBankAccount(order.bankAccount.accountNumber)
                  : '-'}{' '}
                <br />
                {t('accountName')} {order.bankAccount?.accountName || '-'}
              </>
            }
          />
        )}
        {order.isTaxInvoiceRequested && (
          <CustomerCard
            icon={<IconReceipt />}
            title={t('taxInvoiceInfo')}
            content={
              <>
                {t('taxName')} {order.taxName || '-'}
                <br />
                {t('taxId')} {order.taxId ? formatPromptPay(order.taxId) : '-'}
                <br />
                {t('branch')} {order.taxBranchCode || t('headquarters')}
                <br />
                {t('registeredAddress')} {order.taxAddress || '-'}
              </>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
