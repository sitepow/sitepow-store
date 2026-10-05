'use server'

import {
  WebhookEndpointFormValues,
  webhookEndpointSchema,
} from '@/zod/store/webhook-settings'

import { verifyEmployeePermission } from '@/lib/auth/permission'
import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { retryWebhookDelivery, sendTestWebhook } from '@/lib/webhook/dispatcher'
import { generateWebhookSecret } from '@/lib/webhook/signer'

export async function getWebhookEndpoints(storeId: string) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
    })

    return {
      success: true,
      data: endpoints,
    }
  } catch (error) {
    console.error('getWebhookEndpoints error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Webhook' }
  }
}

export async function createWebhookEndpoint(
  storeId: string,
  input: WebhookEndpointFormValues,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const parsed = webhookEndpointSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const endpoint = await prisma.webhookEndpoint.create({
      data: {
        storeId,
        url: parsed.data.url,
        secret: parsed.data.secret || generateWebhookSecret(),
        description: parsed.data.description,
        isActive: parsed.data.isActive,
        events: parsed.data.events,
      },
    })

    return {
      success: true,
      data: endpoint,
      message: 'สร้าง Webhook Endpoint สำเร็จ',
    }
  } catch (error) {
    console.error('createWebhookEndpoint error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้าง Webhook' }
  }
}

export async function updateWebhookEndpoint(
  id: string,
  storeId: string,
  input: Partial<WebhookEndpointFormValues>,
) {
  try {
    if (!id || !storeId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updated = await prisma.webhookEndpoint.update({
      where: { id, storeId },
      data: {
        ...(input.url ? { url: input.url } : {}),
        ...(input.secret ? { secret: input.secret } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.events ? { events: input.events } : {}),
      },
    })

    return {
      success: true,
      data: updated,
      message: 'อัปเดต Webhook Endpoint สำเร็จ',
    }
  } catch (error) {
    console.error('updateWebhookEndpoint error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดต Webhook' }
  }
}

export async function deleteWebhookEndpoint(id: string, storeId: string) {
  try {
    if (!id || !storeId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.webhookEndpoint.delete({
      where: { id, storeId },
    })

    return {
      success: true,
      message: 'ลบ Webhook Endpoint สำเร็จ',
    }
  } catch (error) {
    console.error('deleteWebhookEndpoint error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการลบ Webhook' }
  }
}

export async function regenerateWebhookSecretAction(
  id: string,
  storeId: string,
) {
  try {
    if (!id || !storeId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const newSecret = generateWebhookSecret()

    const updated = await prisma.webhookEndpoint.update({
      where: { id, storeId },
      data: { secret: newSecret },
    })

    return {
      success: true,
      data: updated,
      message: 'สร้าง Secret Key ใหม่สำเร็จ',
    }
  } catch (error) {
    console.error('regenerateWebhookSecretAction error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการสร้าง Secret ใหม่' }
  }
}

export async function testWebhookEndpointAction(
  endpointId: string,
  storeId: string,
) {
  try {
    if (!endpointId || !storeId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const result = await sendTestWebhook(endpointId)

    return {
      success: true,
      data: result,
      message: result.success
        ? `ส่งทดสอบสำเร็จ (Status ${result.statusCode}, ${result.durationMs}ms)`
        : `ส่งทดสอบไม่สำเร็จ: ${result.errorMessage || `HTTP ${result.statusCode}`}`,
    }
  } catch (error) {
    console.error('testWebhookEndpointAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการทดสอบ Webhook',
    }
  }
}

export async function getWebhookDeliveries(
  storeId: string,
  endpointId?: string,
  limit = 20,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where: {
        storeId,
        ...(endpointId ? { endpointId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        endpoint: {
          select: { url: true, description: true },
        },
      },
    })

    return {
      success: true,
      data: deliveries,
    }
  } catch (error) {
    console.error('getWebhookDeliveries error:', error)
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงประวัติการส่ง Webhook',
    }
  }
}

export async function retryWebhookDeliveryAction(
  deliveryId: string,
  storeId: string,
) {
  try {
    if (!deliveryId || !storeId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const result = await retryWebhookDelivery(deliveryId)

    return {
      success: true,
      data: result,
      message: result.success
        ? `ส่งซ้ำสำเร็จ (Status ${result.statusCode}, ${result.durationMs}ms)`
        : `ส่งซ้ำไม่สำเร็จ: ${result.errorMessage || `HTTP ${result.statusCode}`}`,
    }
  } catch (error) {
    console.error('retryWebhookDeliveryAction error:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการส่งซ้ำ Webhook',
    }
  }
}
