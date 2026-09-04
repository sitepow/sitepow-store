import { NextResponse } from 'next/server'

import { MarketplacePlatform } from '@/generated/prisma/enums'

import { handleInboundMarketplaceOrder } from '@/lib/marketplace/sync-service'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const shopId = String(body.shop_id || body.shopId || '')
    const orderSn = String(
      body.data?.order_sn || body.order_sn || `SHOPEE-${Date.now()}`,
    )
    const rawItems = body.data?.item_list || body.items || []

    const items = rawItems.map((i: any) => ({
      marketplaceItemId: String(i.item_id || i.itemId || ''),
      marketplaceSku: String(i.model_sku || i.item_sku || i.sku || ''),
      quantity: Number(i.model_quantity_purchased || i.quantity || 1),
      price: Number(i.model_discounted_price || i.price || 0),
    }))

    if (items.length > 0 && shopId) {
      const result = await handleInboundMarketplaceOrder({
        orderId: orderSn,
        platform: MarketplacePlatform.SHOPEE,
        shopId,
        items,
        totalAmount: Number(body.data?.total_amount || 0),
        status: body.data?.status || 'PAID',
      })

      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ success: true, message: 'Event received' })
  } catch (error: any) {
    console.error('Shopee webhook error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    )
  }
}
