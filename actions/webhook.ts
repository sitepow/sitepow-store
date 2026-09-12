'use server'

import { Prisma } from '@/generated/prisma/client'
import { WebhookEndpointFormValues, webhookEndpointSchema } from '@/zod/webhook'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import {
  generateWebhookSecret,
  retryWebhookLog,
  sendWebhookTestPing,
} from '@/lib/webhook'

const webhookEndpointSelect = {
  id: true,
  storeId: true,
  url: true,
  description: true,
  secret: true,
  events: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      logs: true,
    },
  },
} satisfies Prisma.StoreWebhookEndpointSelect

export type StoreWebhookEndpointItem = Prisma.StoreWebhookEndpointGetPayload<{
  select: typeof webhookEndpointSelect
}>

export async function getStoreWebhookEndpoints(
  storeId: string,
): Promise<StoreWebhookEndpointItem[]> {
  if (!storeId) return []

  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) return []

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewStoreSettings',
    })

    if (!authCheck.isAuthorized) return []

    return await prisma.storeWebhookEndpoint.findMany({
      where: { storeId },
      select: webhookEndpointSelect,
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching webhook endpoints:', error)
    return []
  }
}

export async function createStoreWebhookEndpoint(
  storeId: string,
  input: WebhookEndpointFormValues,
) {
  try {
    if (!storeId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Store ID',
        messageEN: 'Store ID not found',
        message: 'ไม่พบ Store ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'คุณไม่มีสิทธิ์ในการตั้งค่า Webhook',
        messageEN:
          authCheck.messageEN ||
          'You do not have permission to configure Webhooks',
        message: authCheck.message || 'คุณไม่มีสิทธิ์ในการตั้งค่า Webhook',
      }
    }

    const parsed = webhookEndpointSchema.safeParse(input)
    if (!parsed.success) {
      const validationMsg =
        parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง'
      return {
        success: false,
        messageTH: validationMsg,
        messageEN: validationMsg,
        message: validationMsg,
      }
    }

    const secret = generateWebhookSecret()

    const endpoint = await prisma.storeWebhookEndpoint.create({
      data: {
        storeId,
        url: parsed.data.url,
        description: parsed.data.description || null,
        secret,
        events: parsed.data.events,
        isActive: parsed.data.isActive ?? true,
      },
      select: webhookEndpointSelect,
    })

    return {
      success: true,
      messageTH: 'สร้าง Webhook Endpoint สำเร็จ',
      messageEN: 'Webhook endpoint created successfully',
      message: 'สร้าง Webhook Endpoint สำเร็จ',
      data: endpoint,
    }
  } catch (error) {
    console.error('Error creating webhook endpoint:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการสร้าง Webhook',
      messageEN: 'An error occurred while creating webhook endpoint',
      message: 'เกิดข้อผิดพลาดในการสร้าง Webhook',
    }
  }
}

export async function updateStoreWebhookEndpoint(
  endpointId: string,
  input: WebhookEndpointFormValues,
) {
  try {
    if (!endpointId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Endpoint ID',
        messageEN: 'Endpoint ID not found',
        message: 'ไม่พบ Endpoint ID',
      }
    }

    const existing = await prisma.storeWebhookEndpoint.findUnique({
      where: { id: endpointId },
      select: { storeId: true },
    })

    if (!existing) {
      return {
        success: false,
        messageTH: 'ไม่พบ Webhook Endpoint นี้',
        messageEN: 'Webhook endpoint not found',
        message: 'ไม่พบ Webhook Endpoint นี้',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existing.storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'คุณไม่มีสิทธิ์ในการแก้ไข Webhook',
        messageEN:
          authCheck.messageEN || 'You do not have permission to edit Webhooks',
        message: authCheck.message || 'คุณไม่มีสิทธิ์ในการแก้ไข Webhook',
      }
    }

    const parsed = webhookEndpointSchema.safeParse(input)
    if (!parsed.success) {
      const validationMsg =
        parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง'
      return {
        success: false,
        messageTH: validationMsg,
        messageEN: validationMsg,
        message: validationMsg,
      }
    }

    const updated = await prisma.storeWebhookEndpoint.update({
      where: { id: endpointId },
      data: {
        url: parsed.data.url,
        description: parsed.data.description || null,
        events: parsed.data.events,
        isActive: parsed.data.isActive,
      },
      select: webhookEndpointSelect,
    })

    return {
      success: true,
      messageTH: 'อัปเดต Webhook Endpoint สำเร็จ',
      messageEN: 'Webhook endpoint updated successfully',
      message: 'อัปเดต Webhook Endpoint สำเร็จ',
      data: updated,
    }
  } catch (error) {
    console.error('Error updating webhook endpoint:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการอัปเดต Webhook',
      messageEN: 'An error occurred while updating webhook endpoint',
      message: 'เกิดข้อผิดพลาดในการอัปเดต Webhook',
    }
  }
}

export async function deleteStoreWebhookEndpoint(endpointId: string) {
  try {
    if (!endpointId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Endpoint ID',
        messageEN: 'Endpoint ID not found',
        message: 'ไม่พบ Endpoint ID',
      }
    }

    const existing = await prisma.storeWebhookEndpoint.findUnique({
      where: { id: endpointId },
      select: { storeId: true },
    })

    if (!existing) {
      return {
        success: false,
        messageTH: 'ไม่พบ Webhook Endpoint',
        messageEN: 'Webhook endpoint not found',
        message: 'ไม่พบ Webhook Endpoint',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existing.storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'คุณไม่มีสิทธิ์ในการลบ Webhook',
        messageEN:
          authCheck.messageEN ||
          'You do not have permission to delete Webhooks',
        message: authCheck.message || 'คุณไม่มีสิทธิ์ในการลบ Webhook',
      }
    }

    await prisma.storeWebhookEndpoint.delete({
      where: { id: endpointId },
    })

    return {
      success: true,
      messageTH: 'ลบ Webhook Endpoint สำเร็จ',
      messageEN: 'Webhook endpoint deleted successfully',
      message: 'ลบ Webhook Endpoint สำเร็จ',
      storeId: existing.storeId,
    }
  } catch (error) {
    console.error('Error deleting webhook endpoint:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการลบ Webhook',
      messageEN: 'An error occurred while deleting webhook endpoint',
      message: 'เกิดข้อผิดพลาดในการลบ Webhook',
    }
  }
}

export async function regenerateWebhookSecret(endpointId: string) {
  try {
    if (!endpointId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Endpoint ID',
        messageEN: 'Endpoint ID not found',
        message: 'ไม่พบ Endpoint ID',
      }
    }

    const existing = await prisma.storeWebhookEndpoint.findUnique({
      where: { id: endpointId },
      select: { storeId: true },
    })

    if (!existing) {
      return {
        success: false,
        messageTH: 'ไม่พบ Webhook Endpoint',
        messageEN: 'Webhook endpoint not found',
        message: 'ไม่พบ Webhook Endpoint',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existing.storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
        messageEN:
          authCheck.messageEN ||
          'You do not have permission to perform this action',
        message: authCheck.message || 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
      }
    }

    const newSecret = generateWebhookSecret()

    const updated = await prisma.storeWebhookEndpoint.update({
      where: { id: endpointId },
      data: { secret: newSecret },
      select: webhookEndpointSelect,
    })

    return {
      success: true,
      messageTH: 'สร้าง Signing Secret ใหม่สำเร็จ',
      messageEN: 'New signing secret generated successfully',
      message: 'สร้าง Signing Secret ใหม่สำเร็จ',
      data: updated,
    }
  } catch (error) {
    console.error('Error regenerating webhook secret:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการสร้าง Secret ใหม่',
      messageEN: 'An error occurred while regenerating webhook secret',
      message: 'เกิดข้อผิดพลาดในการสร้าง Secret ใหม่',
    }
  }
}

export async function getStoreWebhookLogs(
  endpointId: string,
  limit: number = 20,
) {
  if (!endpointId) return []

  try {
    const existing = await prisma.storeWebhookEndpoint.findUnique({
      where: { id: endpointId },
      select: { storeId: true },
    })

    if (!existing) return []

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) return []

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existing.storeId,
      permission: 'canViewStoreSettings',
    })

    if (!authCheck.isAuthorized) return []

    return await prisma.storeWebhookLog.findMany({
      where: { endpointId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error fetching webhook logs:', error)
    return []
  }
}

export async function testWebhookEndpoint(endpointId: string) {
  try {
    if (!endpointId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Endpoint ID',
        messageEN: 'Endpoint ID not found',
        message: 'ไม่พบ Endpoint ID',
      }
    }

    const existing = await prisma.storeWebhookEndpoint.findUnique({
      where: { id: endpointId },
      select: { storeId: true },
    })

    if (!existing) {
      return {
        success: false,
        messageTH: 'ไม่พบ Webhook Endpoint',
        messageEN: 'Webhook endpoint not found',
        message: 'ไม่พบ Webhook Endpoint',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existing.storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'คุณไม่มีสิทธิ์ในการทดสอบ Webhook',
        messageEN:
          authCheck.messageEN || 'You do not have permission to test Webhooks',
        message: authCheck.message || 'คุณไม่มีสิทธิ์ในการทดสอบ Webhook',
      }
    }

    const result = await sendWebhookTestPing(endpointId)

    const testMsgTH = result.success
      ? `ส่ง Webhook ทดสอบสำเร็จ (Status: ${result.statusCode}, ${result.executionTimeMs}ms)`
      : `ส่ง Webhook ทดสอบไม่สำเร็จ (${result.errorMessage || `Status: ${result.statusCode}`})`
    const testMsgEN = result.success
      ? `Test webhook sent successfully (Status: ${result.statusCode}, ${result.executionTimeMs}ms)`
      : `Test webhook failed (${result.errorMessage || `Status: ${result.statusCode}`})`

    return {
      success: result.success,
      messageTH: testMsgTH,
      messageEN: testMsgEN,
      message: testMsgTH,
      data: result,
      storeId: existing.storeId,
    }
  } catch (error: unknown) {
    console.error('Error sending test webhook:', error)
    const errMessage =
      error instanceof Error
        ? error.message
        : 'เกิดข้อผิดพลาดในการทดสอบ Webhook'
    return {
      success: false,
      messageTH: errMessage,
      messageEN:
        error instanceof Error
          ? error.message
          : 'An error occurred while testing webhook',
      message: errMessage,
    }
  }
}

export async function resendWebhookLog(logId: string) {
  try {
    if (!logId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Log ID',
        messageEN: 'Log ID not found',
        message: 'ไม่พบ Log ID',
      }
    }

    const log = await prisma.storeWebhookLog.findUnique({
      where: { id: logId },
      include: {
        endpoint: {
          select: { storeId: true, id: true },
        },
      },
    })

    if (!log || !log.endpoint) {
      return {
        success: false,
        messageTH: 'ไม่พบประวัติหรือ Webhook Endpoint ที่เชื่อมโยง',
        messageEN: 'Webhook log or associated endpoint not found',
        message: 'ไม่พบประวัติหรือ Webhook Endpoint ที่เชื่อมโยง',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: log.endpoint.storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'คุณไม่มีสิทธิ์ในการส่ง Webhook ซ้ำ',
        messageEN:
          authCheck.messageEN ||
          'You do not have permission to resend Webhooks',
        message: authCheck.message || 'คุณไม่มีสิทธิ์ในการส่ง Webhook ซ้ำ',
      }
    }

    const result = await retryWebhookLog(logId)

    const resendMsgTH = result.success
      ? `ส่ง Webhook อีกครั้งสำเร็จ (Status: ${result.statusCode}, ${result.executionTimeMs}ms)`
      : `ส่ง Webhook อีกครั้งไม่สำเร็จ (${result.errorMessage || `Status: ${result.statusCode}`})`
    const resendMsgEN = result.success
      ? `Webhook resent successfully (Status: ${result.statusCode}, ${result.executionTimeMs}ms)`
      : `Failed to resend webhook (${result.errorMessage || `Status: ${result.statusCode}`})`

    return {
      success: result.success,
      messageTH: resendMsgTH,
      messageEN: resendMsgEN,
      message: resendMsgTH,
      data: result,
      endpointId: log.endpoint.id,
      storeId: log.endpoint.storeId,
    }
  } catch (error: unknown) {
    console.error('Error resending webhook:', error)
    const errMessage =
      error instanceof Error
        ? error.message
        : 'เกิดข้อผิดพลาดในการส่ง Webhook ซ้ำ'
    return {
      success: false,
      messageTH: errMessage,
      messageEN:
        error instanceof Error
          ? error.message
          : 'An error occurred while resending webhook',
      message: errMessage,
    }
  }
}
