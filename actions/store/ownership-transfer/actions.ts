'use server'

import { invalidateStoreCache } from '@/actions/store/management/invalidation'
import { invalidateEmployeePermissionCache } from '@/actions/store/permission/invalidation'
import { DAY, TRANSFER_EXPIRY_DAYS } from '@/constants/system'
import StoreOwnershipTransferEmail from '@/emails/store/StoreOwnershipTransferEmail'
import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, TransferStatus } from '@/generated/prisma/enums'
import { fromNow, isPast } from '@/utils/formatting/date'

import { createLog } from '@/lib/activity/log'
import {
  setupStoreOwnerPermissions,
  verifyEmployeePermission,
} from '@/lib/auth/permission'
import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/integrations/resend'

const transferRequestSelect = {
  id: true,
  token: true,
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
      return { success: false, message: 'ไม่พบ Store ID' }
    }
    const cleanToEmail = toEmail?.trim().toLowerCase()
    if (!cleanToEmail) {
      return { success: false, message: 'กรุณาระบุอีเมลผู้รับ' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (userSession.email?.toLowerCase() === cleanToEmail) {
      return {
        success: false,
        message: 'ไม่สามารถส่งคำขอโอนร้านค้าให้บัญชีของตัวเองได้',
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
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, slug: true, ownerId: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบร้านค้า' }
    }
    if (store.ownerId !== fromOwnerId || store.ownerId !== userId) {
      return { success: false, message: 'คุณไม่ใช่เจ้าของร้านค้านี้' }
    }

    const toUser = await prisma.user.findUnique({
      where: { email: cleanToEmail },
      select: { id: true, name: true, email: true },
    })

    if (!toUser) {
      return {
        success: false,
        message:
          'ไม่พบบัญชีผู้ใช้ที่มีอีเมลนี้ในระบบ กรุณาให้ผู้รับสมัครสมาชิกก่อนทำรายการ',
      }
    }

    const pending = await prisma.storeTransferRequest.findFirst({
      where: { storeId, status: TransferStatus.PENDING },
    })

    if (pending) {
      if (isPast(pending.expiresAt)) {
        await prisma.storeTransferRequest.update({
          where: { id: pending.id },
          data: { status: TransferStatus.EXPIRED },
        })
      } else {
        return {
          success: false,
          message:
            'มีคำขอโอนที่รอการยืนยันอยู่แล้ว กรุณายกเลิกคำขอเดิมก่อนส่งใหม่',
        }
      }
    }

    const createdRequest = await prisma.storeTransferRequest.create({
      data: {
        storeId,
        fromOwnerId,
        toEmail: cleanToEmail,
        toUserId: toUser.id,
        expiresAt: fromNow(TRANSFER_EXPIRY_DAYS * DAY),
      },
    })

    // Construct accept link and send email via Resend
    const appUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://manage.sitepow.store'
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
            '://lvh.me',
            '://manage.lvh.me',
          )
    const acceptLink = `${appUrl}/merchant/transfer/${createdRequest.token}`

    let emailWarning = ''
    try {
      const fromUser = await prisma.user.findUnique({
        where: { id: fromOwnerId },
        select: { name: true, email: true },
      })

      const { error: resendError, data: resendData } = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL || 'Sitepow Store <noreply@faos.asia>',
        to: [cleanToEmail],
        subject: `คำขอโอนย้ายความเป็นเจ้าของร้านค้า: ${store.name}`,
        react: StoreOwnershipTransferEmail({
          storeName: store.name,
          fromOwnerName: fromUser?.name || fromUser?.email || 'เจ้าของร้านค้า',
          acceptLink,
          expiryHours: TRANSFER_EXPIRY_DAYS * 24,
        }),
      })

      if (resendError) {
        console.error('Resend transfer email error:', resendError)
        emailWarning = ` (หมายเหตุ: การส่งอีเมลไม่สำเร็จ: ${resendError.message} แต่คุณสามารถคัดลอกลิงก์ในตารางส่งให้ผู้รับได้)`
      } else {
        console.log('Transfer email sent via Resend, id:', resendData?.id)
      }
    } catch (emailErr) {
      console.error('Failed to send transfer email:', emailErr)
      emailWarning = ' (หมายเหตุ: ไม่สามารถส่งอีเมลได้ กรุณาคัดลอกลิงก์ในตารางส่งให้ผู้รับโดยตรง)'
    }

    await createLog({
      action: LogAction.TRANSFER_STORE,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'StoreTransferRequest',
      entityId: createdRequest.id,
      details: {
        toEmail: cleanToEmail,
        status: 'created',
        requestId: createdRequest.id,
      },
    })

    return {
      success: true,
      message: emailWarning
        ? `ส่งคำขอโอนร้านค้าสำเร็จ${emailWarning}`
        : `ส่งคำขอโอนร้านค้าและส่งอีเมลยืนยันไปยัง ${cleanToEmail} เรียบร้อยแล้ว (หากไม่พบโปรดตรวจสอบใน Junk/Spam)`,
    }
  } catch (error) {
    console.error('createTransferRequest error:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการส่งคำขอโอนร้านค้า',
    }
  }
}

export async function resendTransferEmail(
  requestId: string,
  ownerId: string,
) {
  try {
    if (!requestId) {
      return { success: false, message: 'ไม่พบ Request ID' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { id: requestId },
      include: {
        store: { select: { id: true, name: true, ownerId: true } },
      },
    })

    if (!request) {
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }

    if (request.fromOwnerId !== ownerId || request.fromOwnerId !== userId) {
      return { success: false, message: 'คุณไม่มีสิทธิ์ส่งอีเมลซ้ำสำหรับคำขอนี้' }
    }

    if (request.status !== TransferStatus.PENDING) {
      return { success: false, message: 'คำขอนี้ไม่ได้อยู่ในสถานะรอการยืนยัน' }
    }

    if (isPast(request.expiresAt)) {
      await prisma.storeTransferRequest.update({
        where: { id: request.id },
        data: { status: TransferStatus.EXPIRED },
      })
      return { success: false, message: 'คำขอนี้หมดอายุแล้ว กรุณาสร้างคำขอใหม่' }
    }

    const appUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://manage.sitepow.store'
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
            '://lvh.me',
            '://manage.lvh.me',
          )
    const acceptLink = `${appUrl}/merchant/transfer/${request.token}`

    const fromUser = await prisma.user.findUnique({
      where: { id: request.fromOwnerId },
      select: { name: true, email: true },
    })

    const { error: resendError, data: resendData } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        'Sitepow Store <noreply@faos.asia>',
      to: [request.toEmail],
      subject: `คำขอโอนย้ายความเป็นเจ้าของร้านค้า: ${request.store.name}`,
      react: StoreOwnershipTransferEmail({
        storeName: request.store.name,
        fromOwnerName: fromUser?.name || fromUser?.email || 'เจ้าของร้านค้า',
        acceptLink,
        expiryHours: TRANSFER_EXPIRY_DAYS * 24,
      }),
    })

    if (resendError) {
      console.error('Resend transfer email error:', resendError)
      return {
        success: false,
        message: `ไม่สามารถส่งอีเมลได้: ${resendError.message}`,
      }
    }

    return {
      success: true,
      message: `ส่งอีเมลยืนยันไปยัง ${request.toEmail} สำเร็จแล้ว (โปรดตรวจสอบในโฟลเดอร์ Junk/Spam ด้วย)`,
      data: resendData,
    }
  } catch (error) {
    console.error('resendTransferEmail error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งอีเมล',
    }
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

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { id: requestId },
      select: { storeId: true, fromOwnerId: true, status: true, toEmail: true },
    })

    if (!request) {
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: request.storeId,
      permission: 'canDeleteTransferStore',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (request.fromOwnerId !== ownerId || request.fromOwnerId !== userId) {
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
      details: { status: 'cancelled', toEmail: request.toEmail },
    })

    return { success: true, message: 'ยกเลิกคำขอโอนสำเร็จ' }
  } catch (error) {
    console.error('cancelTransferRequest error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการยกเลิกคำขอโอน' }
  }
}

export async function getTransferRequestByToken(token: string) {
  try {
    if (!token) {
      return { success: false, message: 'ไม่พบ Token คำขอโอน' }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { token },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            ownerId: true,
          },
        },
      },
    })

    if (!request) {
      return {
        success: false,
        message: 'ไม่พบคำขอโอนร้านค้านี้ หรือลิงก์ไม่ถูกต้อง',
      }
    }

    const fromOwner = await prisma.user.findUnique({
      where: { id: request.fromOwnerId },
      select: { id: true, name: true, email: true, image: true },
    })

    let status = request.status
    if (status === TransferStatus.PENDING && isPast(request.expiresAt)) {
      status = TransferStatus.EXPIRED
      await prisma.storeTransferRequest.update({
        where: { id: request.id },
        data: { status: TransferStatus.EXPIRED },
      })
    }

    const userSession = await getCurrentUser()
    const currentUser = userSession
      ? {
          id: userSession.id,
          name: userSession.name,
          email: userSession.email,
        }
      : null

    const isRecipient = currentUser
      ? currentUser.email?.toLowerCase() === request.toEmail.toLowerCase() ||
        (request.toUserId && request.toUserId === currentUser.id)
      : false

    return {
      success: true,
      data: {
        id: request.id,
        token: request.token,
        toEmail: request.toEmail,
        status,
        expiresAt: request.expiresAt,
        createdAt: request.createdAt,
        store: request.store,
        fromOwner,
        currentUser,
        isRecipient,
      },
    }
  } catch (error) {
    console.error('getTransferRequestByToken error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลคำขอโอน' }
  }
}

export async function acceptTransferRequest(token: string, userId: string) {
  try {
    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId || currentUserId !== userId) {
      return {
        success: false,
        message: 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับโอนที่ถูกต้อง',
      }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { token },
      include: {
        store: {
          include: {
            branches: { select: { id: true } },
          },
        },
      },
    })

    if (!request) {
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }

    const userEmail = userSession.email?.toLowerCase()
    const isTargetRecipient =
      (userEmail && userEmail === request.toEmail.toLowerCase()) ||
      request.toUserId === userId

    if (!isTargetRecipient) {
      return {
        success: false,
        message: `คุณเข้าสู่ระบบด้วยอีเมล ${userSession.email} แต่คำขอนี้ส่งถึง ${request.toEmail}`,
      }
    }

    if (request.status !== TransferStatus.PENDING) {
      return {
        success: false,
        message: `คำขอนี้ได้รับการ${request.status === TransferStatus.ACCEPTED ? 'ยอมรับ' : 'ยกเลิกหรือปฏิเสธ'}ไปแล้ว`,
      }
    }

    if (isPast(request.expiresAt)) {
      await prisma.storeTransferRequest.update({
        where: { id: request.id },
        data: { status: TransferStatus.EXPIRED },
      })
      return { success: false, message: 'คำขอโอนนี้หมดอายุแล้ว' }
    }

    const storeId = request.storeId
    const oldOwnerId = request.fromOwnerId

    await prisma.$transaction(async (tx) => {
      // 1. Update store owner
      await tx.store.update({
        where: { id: storeId },
        data: { ownerId: userId },
      })

      // 2. Update transfer request status
      await tx.storeTransferRequest.update({
        where: { id: request.id },
        data: {
          status: TransferStatus.ACCEPTED,
          toUserId: userId,
        },
      })

      // 3. Setup owner permissions for new owner
      const branchIds = request.store.branches.map((b) => b.id)
      await setupStoreOwnerPermissions(
        {
          userId,
          storeId,
          branchIds,
        },
        tx,
      )
    })

    // 4. Invalidate caches for both users and store
    await Promise.allSettled([
      invalidateStoreCache(request.store.slug),
      invalidateEmployeePermissionCache(oldOwnerId, storeId),
      invalidateEmployeePermissionCache(userId, storeId),
    ])

    // 5. Activity log
    await createLog({
      action: LogAction.TRANSFER_STORE,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'StoreTransferRequest',
      entityId: request.id,
      details: {
        summary: `โอนความเป็นเจ้าของร้านค้าสำเร็จ ให้แก่ผู้ใช้ ${userSession.name || userSession.email}`,
        status: 'accepted',
        newOwnerId: userId,
        previousOwnerId: oldOwnerId,
      },
    })

    return {
      success: true,
      message: 'รับโอนสิทธิ์ความเป็นเจ้าของร้านค้าสำเร็จ',
      data: {
        storeId: request.store.id,
        storeName: request.store.name,
        storeSlug: request.store.slug,
      },
    }
  } catch (error) {
    console.error('acceptTransferRequest error:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการรับโอนร้านค้า',
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
        message: 'กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับโอนที่ถูกต้อง',
      }
    }

    const request = await prisma.storeTransferRequest.findUnique({
      where: { token },
      select: {
        id: true,
        storeId: true,
        toUserId: true,
        toEmail: true,
        status: true,
      },
    })

    if (!request) {
      return { success: false, message: 'ไม่พบคำขอโอนนี้' }
    }

    const userEmail = userSession.email?.toLowerCase()
    const isTargetRecipient =
      (userEmail && userEmail === request.toEmail.toLowerCase()) ||
      request.toUserId === userId

    if (!isTargetRecipient) {
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
      details: { status: 'declined', userId },
    })

    return { success: true, message: 'ปฏิเสธคำขอโอนเรียบร้อยแล้ว' }
  } catch (error) {
    console.error('declineTransferRequest error:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอโอน' }
  }
}
