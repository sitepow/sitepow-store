'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { GetOrdersItem } from '@/actions/order'
import { Store, User2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

interface OrderCustomerInfoProps {
  order: GetOrdersItem
  isCancelled: boolean
}

export function OrderCustomerInfo({
  order,
  isCancelled,
}: OrderCustomerInfoProps) {
  const t = useTranslations('merchant.orders')

  const isResellerPOS =
    order.orderNumber?.startsWith('RS-POS-') ||
    Boolean((order as { resellerAgreementId?: string }).resellerAgreementId)

  const isPOSOrder =
    !isResellerPOS &&
    (order.orderNumber?.startsWith('POS-') ||
      (order as { isPOS?: boolean }).isPOS)

  const registeredCustomerName = order.customer
    ? [order.customer.firstName, order.customer.lastName]
        .filter(Boolean)
        .join(' ')
    : null

  const employeeName = (
    order as {
      employee?: { firstName?: string; lastName?: string }
    }
  ).employee
    ? [
        (order as { employee?: { firstName?: string } }).employee?.firstName,
        (order as { employee?: { lastName?: string } }).employee?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
    : null

  const resellerInfo = (
    order as {
      resellerAgreement?: {
        resellerStore?: { name?: string }
        resellerUser?: { name?: string; email?: string }
      }
    }
  ).resellerAgreement

  let displayName = registeredCustomerName
  let displaySubtext = order.customer?.email || null

  if (isResellerPOS) {
    displayName =
      resellerInfo?.resellerStore?.name ||
      resellerInfo?.resellerUser?.name ||
      resellerInfo?.resellerUser?.email ||
      t('resellerFallback')
    displaySubtext = t('resellerPosSubtext')
  } else if (isPOSOrder) {
    if (!displayName) {
      displayName = t('walkInCustomer')
    }
    if (employeeName) {
      displaySubtext = t('staffPrefix', { name: employeeName })
    } else if (!displaySubtext) {
      displaySubtext = ''
    }
  } else {
    if (!displayName) {
      displayName = t('guestCustomer')
    }
    if (!displaySubtext) {
      displaySubtext = '-'
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar
        className={cn('size-8 border', isCancelled && 'opacity-60 grayscale')}
      >
        <AvatarFallback className="bg-muted text-muted-foreground">
          {isResellerPOS ? (
            <Store size={15} />
          ) : isPOSOrder && !registeredCustomerName ? (
            <Store size={15} />
          ) : (
            <User2 size={15} />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="max-w-64 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              'text-sm leading-none font-medium',
              isCancelled && 'line-through',
            )}
          >
            {displayName}
          </p>
          {isResellerPOS ? (
            <Badge className="px-1.5 py-0 text-[10px] font-normal">
              {t('resellerBadge')}
            </Badge>
          ) : isPOSOrder ? (
            <Badge className="px-1.5 py-0 text-[10px] font-normal">POS</Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground text-xs">{displaySubtext}</p>
      </div>
    </div>
  )
}
