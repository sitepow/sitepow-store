import { NextResponse } from 'next/server'

import { MarketplacePlatform } from '@/generated/prisma/enums'

import { handleInboundMarketplaceOrder } from '@/lib/marketplace/sync-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const sellerId = String(body.seller_id || body.sellerId || '')
    const orderId = String(
      body.data?.order_id || body.order_id || `LAZADA-${Date.now()}`,
    )
    const rawItems = body.data?.order_items || body.items || []

    const items = rawItems.map((i: any) => ({
      marketplaceItemId: String(i.item_id || i.itemId || ''),
      marketplaceSku: String(i.sku || i.seller_sku || ''),
      quantity: Number(i.quantity || 1),
      price: Number(i.item_price || i.price || 0),
    }))

    if (items.length > 0 && sellerId) {
      const result = await handleInboundMarketplaceOrder({
        orderId,
        platform: MarketplacePlatform.LAZADA,
        shopId: sellerId,
        items,
        totalAmount: Number(body.data?.price || 0),
        status: body.data?.order_status || 'PAID',
      })

      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ success: true, message: 'Event received' })
  } catch (error: any) {
    console.error('Lazada webhook error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    )
  }
}
