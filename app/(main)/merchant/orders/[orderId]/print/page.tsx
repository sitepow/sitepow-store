import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { getOrderById } from '@/actions/order'

import { PrintLayout } from '@/components/pdf/PrintLayout'
import { OrderDocType } from '@/components/pdf/types'
import { Button } from '@/components/ui/button'

interface PrintOrderPageProps {
  params: Promise<{
    orderId: string
  }>
  searchParams: Promise<{
    type?: string
    autoPrint?: string
  }>
}

export async function generateMetadata({
  params,
  searchParams,
}: PrintOrderPageProps): Promise<Metadata> {
  const { orderId } = await params
  const { type = 'document' } = await searchParams
  const t = await getTranslations('merchant.orders')
  return {
    title: t('metaTitle', { type, orderId: orderId.slice(0, 8) }),
  }
}

export default async function PrintOrderPage({
  params,
  searchParams,
}: PrintOrderPageProps) {
  const { orderId } = await params
  const { type = 'receipt', autoPrint = 'true' } = await searchParams
  const t = await getTranslations('merchant.orders')

  const order = await getOrderById(orderId)

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4 text-center">
        <div className="max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-800">
            {t('orderNotFoundTitle')}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {t('orderNotFoundDesc')}
          </p>
          <div className="mt-5">
            <Button asChild variant="default" size="sm">
              <Link href="/merchant/orders">{t('backToOrders')}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const validDocTypes: OrderDocType[] = [
    'receipt',
    'receipt-slip',
    'tax-invoice',
    'delivery-note',
    'shipping-label',
    'packing-slip',
  ]

  const initialDocType = validDocTypes.includes(type as OrderDocType)
    ? (type as OrderDocType)
    : 'receipt'

  return (
    <PrintLayout
      order={order}
      initialDocType={initialDocType}
      autoPrint={autoPrint !== 'false'}
    />
  )
}
