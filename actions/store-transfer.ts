'use server'

import { MILLISECONDS_PER_DAY, TRANSFER_EXPIRY_DAYS } from '@/constants/system'
import { Prisma } from '@/generated/prisma/client'
import { TransferStatus } from '@/generated/prisma/enums'

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
  if (!storeId) {
    throw new Error('ไม่พบ Store ID')
  }
  if (!toEmail) {
    throw new Error('กรุณาระบุอีเมลผู้รับ')
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  if (!store) {
    throw new Error('ไม่พบร้านค้า')
  }
  if (store.ownerId !== fromOwnerId) {
    throw new Error('คุณไม่ใช่เจ้าของร้านค้านี้')
  }

  const toUser = await prisma.user.findUnique({
    where: { email: toEmail },
    select: { id: true },
  })

  if (!toUser) {
    throw new Error('ไม่พบบัญชีผู้ใช้ที่มีอีเมลนี้ในระบบ')
  }

  const pending = await prisma.storeTransferRequest.findFirst({
    where: { storeId, status: TransferStatus.PENDING },
    select: { id: true },
  })

  if (pending) {
    throw new Error('มีคำขอโอนที่รอการยืนยันอยู่แล้ว กรุณายกเลิกก่อน')
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

  return { message: 'ส่งคำขอโอนร้านค้าสำเร็จ' }
}

export async function cancelTransferRequest(
  requestId: string,
  ownerId: string,
) {
  if (!requestId) {
    throw new Error('ไม่พบ Request ID')
  }

  const request = await prisma.storeTransferRequest.findUnique({
    where: { id: requestId },
    select: { fromOwnerId: true, status: true },
  })

  if (!request) {
    throw new Error('ไม่พบคำขอโอนนี้')
  }
  if (request.fromOwnerId !== ownerId) {
    throw new Error('คุณไม่มีสิทธิ์ยกเลิกคำขอนี้')
  }

  if (request.status !== TransferStatus.PENDING) {
    throw new Error('ไม่สามารถยกเลิกคำขอที่ดำเนินการแล้ว')
  }

  await prisma.storeTransferRequest.update({
    where: { id: requestId },
    data: { status: TransferStatus.CANCELLED },
  })

  return { message: 'ยกเลิกคำขอโอนสำเร็จ' }
}

export async function acceptTransferRequest(token: string, userId: string) {
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
    throw new Error('ไม่พบคำขอโอนนี้')
  }
  if (request.toUserId !== userId) {
    throw new Error('คุณไม่ใช่ผู้รับโอนที่ระบุไว้')
  }
  if (request.status !== TransferStatus.PENDING) {
    throw new Error('คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน')
  }
  if (new Date() > request.expiresAt) {
    await prisma.storeTransferRequest.update({
      where: { id: request.id },
      data: { status: TransferStatus.EXPIRED },
    })
    throw new Error('คำขอโอนนี้หมดอายุแล้ว')
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

  return { message: 'รับโอนร้านค้าสำเร็จ' }
}

export async function declineTransferRequest(token: string, userId: string) {
  const request = await prisma.storeTransferRequest.findUnique({
    where: { token },
    select: { id: true, toUserId: true, status: true },
  })

  if (!request) {
    throw new Error('ไม่พบคำขอโอนนี้')
  }
  if (request.toUserId !== userId) {
    throw new Error('คุณไม่ใช่ผู้รับโอนที่ระบุไว้')
  }
  if (request.status !== TransferStatus.PENDING) {
    throw new Error('คำขอนี้ไม่อยู่ในสถานะรอการยืนยัน')
  }

  await prisma.storeTransferRequest.update({
    where: { id: request.id },
    data: { status: TransferStatus.DECLINED },
  })

  return { message: 'ปฏิเสธคำขอโอนสำเร็จ' }
}
