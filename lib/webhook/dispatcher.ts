import { prisma } from '@/lib/db/prisma'

import { generateWebhookSignature } from './signer'

export interface WebhookOrderPayload {
  event: string
  eventId: string
  timestamp: string
  storeId: string
  data: {
    orderId: string
    orderNumber: string
    status: string
    paymentMethod: string | null
    totalAmount: number
    shippingFee: number
    paidAt: string | null
    createdAt: string
    updatedAt?: string
    customer: {
      id: string | null
      name: string | null
      email: string | null
      phone: string | null
    } | null
    shippingAddress: unknown
    items: Array<{
      id: string
      productId: string
      variantId: string
      title: string
      variantTitle: string
      productType: string
      quantity: number
      price: number
      customerNote: string | null // สำคัญมากสำหรับบอทเติมเกม (เช่น UID / Server / บัญชีเกม)
      digitalCodes?: string[]
    }>
  }
}

/**
 * Builds standard order webhook payload from orderId
 */
export async function buildOrderWebhookPayload(
  orderId: string,
  event: string,
): Promise<WebhookOrderPayload | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      items: true,
      digitalItem: {
        select: {
          code: true,
          variantId: true,
        },
      },
    },
  })

  if (!order) return null

  const customerName = order.customer
    ? order.customer.firstName && order.customer.lastName
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : order.customer.user?.name || null
    : null

  const digitalCodesByVariant = new Map<string, string[]>()
  if (order.digitalItem) {
    for (const dItem of order.digitalItem) {
      if (dItem.variantId && dItem.code) {
        const existing = digitalCodesByVariant.get(dItem.variantId) || []
        existing.push(dItem.code)
        digitalCodesByVariant.set(dItem.variantId, existing)
      }
    }
  }

  return {
    event,
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    storeId: order.storeId,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      shippingFee: Number(order.shippingFee || 0),
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: customerName,
            email: order.customer.email,
            phone: order.customer.phone,
          }
        : null,
      shippingAddress: order.shippingAddrSnapshot,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        productType: item.productType,
        quantity: item.quantity,
        price: Number(item.price),
        customerNote: item.customerNote,
        digitalCodes: digitalCodesByVariant.get(item.variantId),
      })),
    },
  }
}

/**
 * Sends a webhook payload to a single endpoint and logs the delivery
 */
export async function sendWebhookToEndpoint({
  endpointId,
  storeId,
  url,
  secret,
  event,
  payload,
}: {
  endpointId: string
  storeId: string
  url: string
  secret: string
  event: string
  payload: unknown
}) {
  const payloadString = JSON.stringify(payload)
  const timestamp = Date.now().toString()
  const signature = generateWebhookSignature(
    `${timestamp}.${payloadString}`,
    secret,
  )

  const startTime = Date.now()
  let statusCode: number | null = null
  let responseBody: string | null = null
  let errorMessage: string | null = null
  let success = false

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Sitepow-Webhook/1.0',
        'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': timestamp,
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    const durationMs = Date.now() - startTime
    statusCode = res.status
    success = res.ok

    try {
      const text = await res.text()
      responseBody = text.slice(0, 3000) // truncate to prevent huge log
    } catch {
      responseBody = null
    }

    const delivery = await prisma.webhookDelivery.create({
      data: {
        endpointId,
        storeId,
        event,
        url,
        payload: payload as object,
        statusCode,
        responseBody,
        errorMessage: success ? null : `HTTP Status ${statusCode}`,
        durationMs,
        success,
      },
    })

    return {
      success,
      statusCode,
      durationMs,
      deliveryId: delivery.id,
      responseBody,
    }
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime
    errorMessage = err instanceof Error ? err.message : String(err)
    success = false

    const delivery = await prisma.webhookDelivery.create({
      data: {
        endpointId,
        storeId,
        event,
        url,
        payload: payload as object,
        statusCode: null,
        responseBody: null,
        errorMessage: errorMessage.slice(0, 3000),
        durationMs,
        success: false,
      },
    })

    return {
      success: false,
      statusCode: null,
      durationMs,
      deliveryId: delivery.id,
      errorMessage,
    }
  }
}

/**
 * Dispatches an order webhook to all active matching endpoints of a store
 */
export async function dispatchOrderWebhook({
  storeId,
  event,
  orderId,
}: {
  storeId: string
  event: string
  orderId: string
}) {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        storeId,
        isActive: true,
        events: { has: event },
      },
    })

    if (!endpoints || endpoints.length === 0) {
      return
    }

    const payload = await buildOrderWebhookPayload(orderId, event)
    if (!payload) return

    // Deliver in parallel (non-blocking)
    await Promise.allSettled(
      endpoints.map((ep) =>
        sendWebhookToEndpoint({
          endpointId: ep.id,
          storeId,
          url: ep.url,
          secret: ep.secret,
          event,
          payload,
        }),
      ),
    )
  } catch (err) {
    console.error('Error dispatching order webhook:', err)
  }
}

/**
 * Sends a test webhook event to an endpoint
 */
export async function sendTestWebhook(endpointId: string) {
  const endpoint = await prisma.webhookEndpoint.findUnique({
    where: { id: endpointId },
    include: { store: { select: { id: true, name: true } } },
  })

  if (!endpoint) {
    throw new Error('ไม่พบ Webhook Endpoint')
  }

  const testPayload = {
    event: 'test.ping',
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    storeId: endpoint.storeId,
    data: {
      message: 'นี่คือการทดสอบการส่ง Webhook จาก Sitepow Store',
      storeName: endpoint.store.name,
      testOrder: {
        orderId: 'test_ord_' + crypto.randomUUID().slice(0, 8),
        orderNumber: 'TEST-ORD-9999',
        status: 'PAID',
        paymentMethod: 'STRIPE_CREDIT_CARD',
        totalAmount: 300.0,
        paidAt: new Date().toISOString(),
        customer: {
          id: 'test_cust_001',
          name: 'สมชาย ทดสอบระบบ',
          email: 'test@example.com',
          phone: '0812345678',
        },
        items: [
          {
            id: 'test_item_01',
            productId: 'prod_game_points',
            title: '1,000 Game Points (เติมเกมทดสอบ)',
            variantTitle: 'Server Asia',
            quantity: 1,
            price: 300.0,
            productType: 'DIGITAL_SERVICE',
            customerNote: 'UID: 12345678, Server: Asia',
          },
        ],
      },
    },
  }

  return await sendWebhookToEndpoint({
    endpointId: endpoint.id,
    storeId: endpoint.storeId,
    url: endpoint.url,
    secret: endpoint.secret,
    event: 'test.ping',
    payload: testPayload,
  })
}

/**
 * Re-delivers a previous webhook delivery
 */
export async function retryWebhookDelivery(deliveryId: string) {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { endpoint: true },
  })

  if (!delivery || !delivery.endpoint) {
    throw new Error('ไม่พบข้อมูลประวัติการส่ง Webhook นี้')
  }

  return await sendWebhookToEndpoint({
    endpointId: delivery.endpointId,
    storeId: delivery.storeId,
    url: delivery.endpoint.url,
    secret: delivery.endpoint.secret,
    event: delivery.event,
    payload: delivery.payload,
  })
}
