import { NextResponse } from 'next/server'

import { MarketplacePlatform } from '@/generated/prisma/enums'

import { handleInboundMarketplaceOrder } from '@/lib/marketplace/sync-service'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token) {
    return new Response(challenge, { status: 200 })
  }

  return new Response('Verification failed', { status: 403 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const entries = body.entry || []
    for (const entry of entries) {
      const catalogId = entry.id
      const changes = entry.changes || []

      for (const change of changes) {
        if (change.field === 'orders' || change.field === 'commerce_orders') {
          const orderData = change.value
          const items = (orderData.items || []).map((i: any) => ({
            marketplaceItemId: String(i.product_id || ''),
            marketplaceSku: String(i.retailer_id || ''),
            quantity: Number(i.quantity || 1),
            price: Number(i.price || 0),
          }))

          if (items.length > 0 && catalogId) {
            await handleInboundMarketplaceOrder({
              orderId: String(orderData.id || `FB-${Date.now()}`),
              platform: MarketplacePlatform.FACEBOOK,
              shopId: catalogId,
              items,
              totalAmount: Number(orderData.total_amount || 0),
              status: 'PAID',
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Facebook webhook error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    )
  }
}
