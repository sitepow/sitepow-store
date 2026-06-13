'use server'

import { MILLISECONDS_PER_DAY, TRANSFER_EXPIRY_DAYS } from '@/constants/system'
import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, TransferStatus } from '@/generated/prisma/enums'

import { createLog } from '@/lib/activity-log'
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
      return { success: false, message: 'ไม่พบ Store ID' }
    }
    if (!toEmail) {
      return { success: false, message: 'กรุณาระบุอีเมลผู้รับ' }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบร้านค้า' }
    }
    if (store.ownerId !== fromOwnerId) {
      return { success: false, message: 'คุณไม่ใช่เจ้าของร้านค้านี้' }
    }

    const toUser = await prisma.user.findUnique({
      where: { email: toEmail },
      select: { id: true },
    })

    if (!toUser) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้ที่มีอีเมลนี้ในระบบ' }
    }

    const pending = await prisma.storeTransferRequest.findFirst({
      where: { storeId, status: TransferStatus.PENDING },
      select: { id: true },
    })

    if (pending) {
      return {
        success: false,
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

    return { success: true, message: 'ส่งคำขอโอนร้านค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function cancelTransferRequest(
  requestId: string,
  ownerId: string,
) {
  try {
    if (!requestId) {
      return { success: false, message: 'ไม่พบ Request ID' }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { id: requestId },
      select: { storeId: true, fromOwnerId: true, status: true },
    })

    if (!request) {
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }
    if (request.fromOwnerId !== ownerId) {
      return { success: false, message: 'คุณไม่มีสิทธิ์ยกเลิกคำขอนี้' }
    }

    if (request.status !== TransferStatus.PENDING) {
      return { success: false, message: 'ไม่สามารถยกเลิกคำขอที่ดำเนินการแล้ว' }
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

    return { success: true, message: 'ยกเลิกคำขอโอนสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function acceptTransferRequest(token: string, userId: string) {
  try {
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
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }
    if (request.toUserId !== userId) {
      return { success: false, message: 'คุณไม่ใช่ผู้รับโอนที่ระบุไว้' }
    }
    if (request.status !== TransferStatus.PENDING) {
      return { success: false, message: 'คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน' }
    }
    if (new Date() > request.expiresAt) {
      await prisma.storeTransferRequest.update({
        where: { id: request.id },
        data: { status: TransferStatus.EXPIRED },
      })
      return { success: false, message: 'คำขอโอนนี้หมดอายุแล้ว' }
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

    return { success: true, message: 'รับโอนร้านค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function declineTransferRequest(token: string, userId: string) {
  try {
    const request = await prisma.storeTransferRequest.findUnique({
      where: { token },
      select: { id: true, storeId: true, toUserId: true, status: true },
    })

    if (!request) {
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }
    if (request.toUserId !== userId) {
      return { success: false, message: 'คุณไม่ใช่ผู้รับโอนที่ระบุไว้' }
    }
    if (request.status !== TransferStatus.PENDING) {
      return { success: false, message: 'คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน' }
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

    return { success: true, message: 'ปฏิเสธคำขอโอนสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
