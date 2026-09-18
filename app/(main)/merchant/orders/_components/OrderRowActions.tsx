'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  IconDotsVertical,
  IconFileDescription,
  IconFileInvoice,
  IconPackageExport,
  IconPrinter,
  IconReceipt,
} from '@tabler/icons-react'

import { GetOrdersItem } from '@/actions/order'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface OrderRowActionsProps {
  order: GetOrdersItem
}

export function OrderRowActions({ order }: OrderRowActionsProps) {
  const t = useTranslations('merchant.orders')

  const handleDownloadDoc = (docType: string) => {
    window.open(`/merchant/orders/${order.id}/print?type=${docType}`, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <IconDotsVertical size={18} />
          <span className="sr-only">{t('openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('orderDocuments')}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleDownloadDoc('receipt')}>
            <IconReceipt size={16} />
            <span>{t('receiptA4')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('receipt-slip')}>
            <IconReceipt size={16} />
            <span>{t('receiptSlip')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('tax-invoice')}>
            <IconFileInvoice size={16} />
            <span>{t('taxInvoice')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('delivery-note')}>
            <IconPackageExport size={16} />
            <span>{t('deliveryNote')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('shipping-label')}>
            <IconPrinter size={16} />
            <span>{t('shippingLabel')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownloadDoc('packing-slip')}>
            <IconFileDescription size={16} />
            <span>{t('packingSlip')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
