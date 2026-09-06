import { WEBHOOK_EVENTS, WebhookEventId } from '@/constants/webhook'
import { Prisma } from '@/generated/prisma/client'
import crypto from 'crypto'

import { prisma } from '@/lib/prisma'

export { WEBHOOK_EVENTS }
export type { WebhookEventId }

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`
}

export function signWebhookPayload(
  payload: string,
  secret: string,
  timestamp: number,
): string {
  const signaturePayload = `${timestamp}.${payload}`
  return crypto
    .createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex')
}

export async function dispatchStoreWebhook(
  storeId: string,
  event: string,
  data: Record<string, unknown>,
) {
  try {
    const endpoints = await prisma.storeWebhookEndpoint.findMany({
      where: {
        storeId,
        isActive: true,
        events: { has: event },
      },
    })

    if (!endpoints || endpoints.length === 0) return

    const timestamp = Math.floor(Date.now() / 1000)
    const payloadObject = {
      id: `evt_${crypto.randomUUID()}`,
      event,
      createdAt: new Date().toISOString(),
      storeId,
      data,
    }
    const payloadString = JSON.stringify(payloadObject)

    await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const startTime = Date.now()
        const signature = signWebhookPayload(
          payloadString,
          endpoint.secret,
          timestamp,
        )

        let statusCode: number | null = null
        let responseBody: string | null = null
        let isSuccess = false
        let errorMessage: string | null = null

        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)

          const res = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'SitePow-Webhook-Dispatcher/1.0',
              'X-Sitepow-Signature': `t=${timestamp},v1=${signature}`,
              'X-Sitepow-Event': event,
            },
            body: payloadString,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)
          statusCode = res.status
          responseBody = await res.text()
          isSuccess = res.ok
        } catch (err: unknown) {
          errorMessage =
            err instanceof Error ? err.message : 'Connection failed'
        }

        const executionTimeMs = Date.now() - startTime

        await prisma.storeWebhookLog.create({
          data: {
            endpointId: endpoint.id,
            event,
            statusCode,
            requestPayload: JSON.parse(payloadString) as Prisma.InputJsonValue,
            responseBody: responseBody ? responseBody.slice(0, 2000) : null,
            executionTimeMs,
            isSuccess,
            errorMessage,
          },
        })
      }),
    )
  } catch (error) {
    console.error('Failed to dispatch store webhook:', error)
  }
}

export async function sendWebhookTestPing(endpointId: string) {
  const endpoint = await prisma.storeWebhookEndpoint.findUnique({
    where: { id: endpointId },
  })

  if (!endpoint) {
    throw new Error('ไม่พบข้อมูล Webhook Endpoint')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const event = 'test.ping'
  const payloadObject = {
    id: `evt_test_${crypto.randomUUID()}`,
    event,
    createdAt: new Date().toISOString(),
    storeId: endpoint.storeId,
    data: {
      message: 'นี่คือข้อมูลทดสอบการส่ง Webhook จาก SitePow Store',
      testOrder: {
        orderId: 'test_ord_123456',
        orderNumber: 'TEST-ORD-9999',
        status: 'PAID',
        totalAmount: 350.0,
        currency: 'THB',
        paidAt: new Date().toISOString(),
        customer: {
          name: 'สมชาย ทดสอบ',
          email: 'test@example.com',
          phone: '0812345678',
        },
        items: [
          {
            id: 'item_sample_1',
            title: 'แพ็กเกจ 350 เพชร (เกมทดสอบ)',
            variantTitle: 'Instant Delivery',
            quantity: 1,
            price: 350.0,
            customerNote: 'UID: 987654321, Server: TH',
          },
        ],
      },
    },
  }
  const payloadString = JSON.stringify(payloadObject)
  const signature = signWebhookPayload(
    payloadString,
    endpoint.secret,
    timestamp,
  )

  const startTime = Date.now()
  let statusCode: number | null = null
  let responseBody: string | null = null
  let isSuccess = false
  let errorMessage: string | null = null

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SitePow-Webhook-Dispatcher/1.0',
        'X-Sitepow-Signature': `t=${timestamp},v1=${signature}`,
        'X-Sitepow-Event': event,
      },
      body: payloadString,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    statusCode = res.status
    responseBody = await res.text()
    isSuccess = res.ok
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : 'Connection failed'
  }

  const executionTimeMs = Date.now() - startTime

  const log = await prisma.storeWebhookLog.create({
    data: {
      endpointId: endpoint.id,
      event,
      statusCode,
      requestPayload: JSON.parse(payloadString) as Prisma.InputJsonValue,
      responseBody: responseBody ? responseBody.slice(0, 2000) : null,
      executionTimeMs,
      isSuccess,
      errorMessage,
    },
  })

  return {
    success: isSuccess,
    statusCode,
    executionTimeMs,
    errorMessage,
    logId: log.id,
  }
}

export async function retryWebhookLog(logId: string) {
  const originalLog = await prisma.storeWebhookLog.findUnique({
    where: { id: logId },
    include: {
      endpoint: true,
    },
  })

  if (!originalLog) {
    throw new Error('ไม่พบข้อมูลประวัติ Webhook นี้')
  }

  const { endpoint } = originalLog
  if (!endpoint) {
    throw new Error('ไม่พบข้อมูล Webhook Endpoint ที่เชื่อมโยงกับประวัตินี้')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const payloadString = JSON.stringify(originalLog.requestPayload)
  const signature = signWebhookPayload(
    payloadString,
    endpoint.secret,
    timestamp,
  )

  const startTime = Date.now()
  let statusCode: number | null = null
  let responseBody: string | null = null
  let isSuccess = false
  let errorMessage: string | null = null

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SitePow-Webhook-Dispatcher/1.0',
        'X-Sitepow-Signature': `t=${timestamp},v1=${signature}`,
        'X-Sitepow-Event': originalLog.event,
        'X-Sitepow-Delivery-Attempt': 'retry',
      },
      body: payloadString,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    statusCode = res.status
    responseBody = await res.text()
    isSuccess = res.ok
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : 'Connection failed'
  }

  const executionTimeMs = Date.now() - startTime

  const newLog = await prisma.storeWebhookLog.create({
    data: {
      endpointId: endpoint.id,
      event: originalLog.event,
      statusCode,
      requestPayload: originalLog.requestPayload as Prisma.InputJsonValue,
      responseBody: responseBody ? responseBody.slice(0, 2000) : null,
      executionTimeMs,
      isSuccess,
      errorMessage,
    },
  })

  return {
    success: isSuccess,
    statusCode,
    executionTimeMs,
    errorMessage,
    logId: newLog.id,
    endpointId: endpoint.id,
    storeId: endpoint.storeId,
  }
}
