'use server'

import {
  MILLISECONDS_PER_DAY,
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
  TRANSFER_EXPIRY_DAYS,
} from '@/constants/system'
import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, TransferStatus } from '@/generated/prisma/enums'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const transferRequestSelect = {
  id: true,
  toEmail: true,
  status: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.StoreTransferRequestSelect

export type GetTransferRequestItem = Prisma.StoreTransferRequestGetPayload<{
  select: typeof transferRequestSelect
}>

export async function getTransferRequests(
  storeId: string,
): Promise<GetTransferRequestItem[]> {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return []
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewTransferStore',
    })

    if (!authCheck.isAuthorized) {
      return []
    }

    return await prisma.storeTransferRequest.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      select: transferRequestSelect,
    })
  } catch {
    return []
  }
}

export async function createTransferRequest(
  storeId: string,
  fromOwnerId: string,
  toEmail: string,
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
    if (!toEmail) {
      return {
        success: false,
        messageTH: 'กรุณาระบุอีเมลผู้รับ',
        messageEN: 'Please specify recipient email',
        message: 'กรุณาระบุอีเมลผู้รับ',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canCreateTransferStore',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบร้านค้า',
        messageEN: 'Store not found',
        message: 'ไม่พบร้านค้า',
      }
    }
    if (store.ownerId !== fromOwnerId || store.ownerId !== userId) {
      return {
        success: false,
        messageTH: 'คุณไม่ใช่เจ้าของร้านค้านี้',
        messageEN: 'You are not the owner of this store',
        message: 'คุณไม่ใช่เจ้าของร้านค้านี้',
      }
    }

    const toUser = await prisma.user.findUnique({
      where: { email: toEmail },
      select: { id: true },
    })

    if (!toUser) {
      return {
        success: false,
        messageTH: 'ไม่พบบัญชีผู้ใช้ที่มีอีเมลนี้ในระบบ',
        messageEN: 'User account with this email not found',
        message: 'ไม่พบบัญชีผู้ใช้ที่มีอีเมลนี้ในระบบ',
      }
    }

    const pending = await prisma.storeTransferRequest.findFirst({
      where: { storeId, status: TransferStatus.PENDING },
      select: { id: true },
    })

    if (pending) {
      return {
        success: false,
        messageTH: 'มีคำขอโอนที่รอการยืนยันอยู่แล้ว กรุณายกเลิกก่อน',
        messageEN:
          'There is already a pending transfer request, please cancel it first',
        message: 'มีคำขอโอนที่รอการยืนยันอยู่แล้ว กรุณายกเลิกก่อน',
      }
    }

    await prisma.storeTransferRequest.create({
      data: {
        storeId,
        fromOwnerId,
        toEmail,
        toUserId: toUser.id,
        expiresAt: new Date(
          Date.now() + TRANSFER_EXPIRY_DAYS * MILLISECONDS_PER_DAY,
        ),
      },
    })

    await createLog({
      action: LogAction.TRANSFER_STORE,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'StoreTransferRequest',
      details: { toEmail, status: 'created' },
    })

    return {
      success: true,
      messageTH: 'ส่งคำขอโอนร้านค้าสำเร็จ',
      messageEN: 'Store transfer request sent successfully',
      message: 'ส่งคำขอโอนร้านค้าสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function cancelTransferRequest(
  requestId: string,
  ownerId: string,
) {
  try {
    if (!requestId) {
      return {
        success: false,
        messageTH: 'ไม่พบ Request ID',
        messageEN: 'Request ID not found',
        message: 'ไม่พบ Request ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { id: requestId },
      select: { storeId: true, fromOwnerId: true, status: true },
    })

    if (!request) {
      return {
        success: false,
        messageTH: 'ไม่พบคำขอโอนนี้',
        messageEN: 'Transfer request not found',
        message: 'ไม่พบคำขอโอนนี้',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: request.storeId,
      permission: 'canDeleteTransferStore',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH:
          authCheck.messageTH ||
          authCheck.message ||
          'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (request.fromOwnerId !== ownerId || request.fromOwnerId !== userId) {
      return {
        success: false,
        messageTH: 'คุณไม่มีสิทธิ์ยกเลิกคำขอนี้',
        messageEN: 'You do not have permission to cancel this request',
        message: 'คุณไม่มีสิทธิ์ยกเลิกคำขอนี้',
      }
    }

    if (request.status !== TransferStatus.PENDING) {
      return {
        success: false,
        messageTH: 'ไม่สามารถยกเลิกคำขอที่ดำเนินการแล้ว',
        messageEN: 'Cannot cancel request that has already been processed',
        message: 'ไม่สามารถยกเลิกคำขอที่ดำเนินการแล้ว',
      }
    }

    await prisma.storeTransferRequest.update({
      where: { id: requestId },
      data: { status: TransferStatus.CANCELLED },
    })

    await createLog({
      action: LogAction.TRANSFER_STORE,
      actorType: ActorType.MERCHANT,
      storeId: request.storeId,
      entity: 'StoreTransferRequest',
      entityId: requestId,
      details: { status: 'cancelled' },
    })

    return {
      success: true,
      messageTH: 'ยกเลิกคำขอโอนสำเร็จ',
      messageEN: 'Store transfer request cancelled successfully',
      message: 'ยกเลิกคำขอโอนสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function acceptTransferRequest(token: string, userId: string) {
  try {
    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId || currentUserId !== userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับโอนที่ถูกต้อง',
        messageEN: 'Please sign in with the correct recipient account',
        message: 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับโอนที่ถูกต้อง',
      }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { token },
      select: {
        id: true,
        storeId: true,
        toUserId: true,
        status: true,
        expiresAt: true,
      },
    })

    if (!request) {
      return {
        success: false,
        messageTH: 'ไม่พบคำขอโอนนี้',
        messageEN: 'Transfer request not found',
        message: 'ไม่พบคำขอโอนนี้',
      }
    }
    if (request.toUserId !== userId) {
      return {
        success: false,
        messageTH: 'คุณไม่ใช่ผู้รับโอนที่ระบุไว้',
        messageEN: 'You are not the designated recipient',
        message: 'คุณไม่ใช่ผู้รับโอนที่ระบุไว้',
      }
    }
    if (request.status !== TransferStatus.PENDING) {
      return {
        success: false,
        messageTH: 'คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน',
        messageEN: 'This request is not pending confirmation',
        message: 'คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน',
      }
    }
    if (new Date() > request.expiresAt) {
      await prisma.storeTransferRequest.update({
        where: { id: request.id },
        data: { status: TransferStatus.EXPIRED },
      })
      return {
        success: false,
        messageTH: 'คำขอโอนนี้หมดอายุแล้ว',
        messageEN: 'This transfer request has expired',
        message: 'คำขอโอนนี้หมดอายุแล้ว',
      }
    }

    await prisma.$transaction([
      prisma.store.update({
        where: { id: request.storeId },
        data: { ownerId: userId },
      }),
      prisma.storeTransferRequest.update({
        where: { id: request.id },
        data: { status: TransferStatus.ACCEPTED },
      }),
    ])

    await createLog({
      action: LogAction.TRANSFER_STORE,
      actorType: ActorType.MERCHANT,
      storeId: request.storeId,
      entity: 'StoreTransferRequest',
      entityId: request.id,
      details: { status: 'accepted' },
    })

    return {
      success: true,
      messageTH: 'รับโอนร้านค้าสำเร็จ',
      messageEN: 'Store transfer accepted successfully',
      message: 'รับโอนร้านค้าสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function declineTransferRequest(token: string, userId: string) {
  try {
    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId || currentUserId !== userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับโอนที่ถูกต้อง',
        messageEN: 'Please sign in with the correct recipient account',
        message: 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับโอนที่ถูกต้อง',
      }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { token },
      select: { id: true, storeId: true, toUserId: true, status: true },
    })

    if (!request) {
      return {
        success: false,
        messageTH: 'ไม่พบคำขอโอนนี้',
        messageEN: 'Transfer request not found',
        message: 'ไม่พบคำขอโอนนี้',
      }
    }
    if (request.toUserId !== userId) {
      return {
        success: false,
        messageTH: 'คุณไม่ใช่ผู้รับโอนที่ระบุไว้',
        messageEN: 'You are not the designated recipient',
        message: 'คุณไม่ใช่ผู้รับโอนที่ระบุไว้',
      }
    }
    if (request.status !== TransferStatus.PENDING) {
      return {
        success: false,
        messageTH: 'คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน',
        messageEN: 'This request is not pending confirmation',
        message: 'คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน',
      }
    }

    await prisma.storeTransferRequest.update({
      where: { id: request.id },
      data: { status: TransferStatus.DECLINED },
    })

    await createLog({
      action: LogAction.TRANSFER_STORE,
      actorType: ActorType.MERCHANT,
      storeId: request.storeId,
      entity: 'StoreTransferRequest',
      entityId: request.id,
      details: { status: 'declined' },
    })

    return {
      success: true,
      messageTH: 'ปฏิเสธคำขอโอนสำเร็จ',
      messageEN: 'Store transfer request declined successfully',
      message: 'ปฏิเสธคำขอโอนสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}
