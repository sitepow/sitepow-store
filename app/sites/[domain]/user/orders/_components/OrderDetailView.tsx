'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { ShippingAddressSnapshot } from '@/actions/order'
import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useStoreData } from '@/stores/sites/use-store-data'
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
} from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
import { OrderItemsSummary } from '@/components/order/ItemsSummary'
import { OrderStatusBadges } from '@/components/order/StatusBadges'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface OrderDetailViewProps {
  order: GetStorefrontOrderItemSerialized
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const t = useTranslations('customer.orders')
  const { store } = useStoreData()
  const { copied, copy } = useCopyToClipboard()
  const [open, setOpen] = useState(false)

  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  const isDirectPayment =
    order.paymentMethod === PaymentMethod.BANK_TRANSFER ||
    order.paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[85vh] gap-2.5 overflow-y-auto sm:max-w-lg"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <DialogHeader>
          <DialogTitle>
            {t('detailTitle', { orderNumber: order.orderNumber })}
          </DialogTitle>
          <DialogDescription>
            {t('storeName')}: {order.store.name} | {t('orderDate')}:{' '}
            {formatDateTime(order.createdAt)}
          </DialogDescription>
          <OrderStatusBadges
            status={order.status}
            paymentMethod={order.paymentMethod}
            isTaxInvoiceRequested={order.isTaxInvoiceRequested}
            paidAt={order.paidAt}
          />
        </DialogHeader>
        <CustomerCard
          icon={<IconMapPin />}
          title={t('shippingAddress')}
          content={
            <>
              {t('recipient')}:{' '}
              {shippingAddr?.receiverName || shippingAddr?.name || '-'} <br />
              {t('phone')}:{' '}
              {shippingAddr?.phone ? formatPromptPay(shippingAddr.phone) : '-'}
              <br />
              {t('address')}: {formatFullAddress(shippingAddr) || '-'}
            </>
          }
        />
        <OrderItemsSummary order={order} />
        {order.trackingNumber ? (
          <CustomerCard
            icon={<IconCubeSend />}
            title={t('tracking')}
            content={
              <>
                {t('trackingNo')}: {order.trackingNumber} <br />
                {t('shippingMethod')}: {order.shippingMethod || '-'}
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
                ? t('preparingShipment')
                : t('processingOrder')
            }
          />
        ) : null}
        <CustomerCard
          icon={<IconPackage />}
          title={t('dimensions')}
          content={
            <>
              {t('weight')}: {formatNumber(order.totalWeight || 0)} {t('kg')}{' '}
              <br />
              {t('size')}: {formatNumber(order.width || 0)} x{' '}
              {formatNumber(order.length || 0)} x{' '}
              {formatNumber(order.height || 0)} {t('cm')}
            </>
          }
        />
        {isDirectPayment && (
          <CustomerCard
            icon={<IconCreditCardPay />}
            title={t('paymentInfo')}
            content={
              <>
                {t('bank')}: {order.bankAccount?.bankName || '-'} <br />
                {t('accountNumber')}:{' '}
                {order.bankAccount?.accountNumber
                  ? formatBankAccount(order.bankAccount.accountNumber)
                  : '-'}{' '}
                <br />
                {t('accountName')}: {order.bankAccount?.accountName || '-'}
              </>
            }
          />
        )}
        {order.isTaxInvoiceRequested && (
          <CustomerCard
            icon={<IconReceipt />}
            title={t('taxInvoice')}
            content={
              <>
                {t('taxCompanyName')}: {order.taxName || '-'}
                <br />
                {t('taxId')}: {order.taxId ? formatPromptPay(order.taxId) : '-'}
                <br />
                {t('branch')}: {order.taxBranchCode || t('headOffice')}
                <br />
                {t('taxAddress')}: {order.taxAddress || '-'}
              </>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
