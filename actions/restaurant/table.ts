'use server'

import { TableStatus } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { appEvents } from '@/lib/events'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface CreateTableZoneInput {
  storeId: string
  branchId: string
  name: string
  sortOrder?: number
}

export interface UpdateTableZoneInput {
  id: string
  name: string
  sortOrder?: number
}

export interface CreateRestaurantTableInput {
  storeId: string
  branchId: string
  zoneId?: string
  tableNumber: string
  seats?: number
}

export interface UpdateRestaurantTableInput {
  id: string
  zoneId?: string | null
  tableNumber?: string
  seats?: number
  status?: TableStatus
}

// ==========================================
// 1. Zone Management Actions
// ==========================================

export async function getTableZones({
  storeId,
  branchId,
}: {
  storeId: string
  branchId?: string
}) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, data: [] }
    }

    const zones = await prisma.tableZone.findMany({
      where: {
        storeId,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { tables: true },
        },
      },
    })

    return { success: true, data: zones }
  } catch (error) {
    console.error('Error fetching table zones:', error)
    return { success: false, data: [] }
  }
}

export async function createTableZone(input: CreateTableZoneInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: input.storeId,
      branchId: input.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการจัดการโต๊ะ' }
    }

    const zone = await prisma.tableZone.create({
      data: {
        storeId: input.storeId,
        branchId: input.branchId,
        name: input.name.trim(),
        sortOrder: input.sortOrder ?? 0,
      },
    })

    return {
      success: true,
      data: zone,
      messageTH: 'สร้างโซนสำเร็จ',
      messageEN: 'Zone created successfully',
    }
  } catch (error) {
    console.error('Error creating table zone:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการสร้างโซน',
      messageEN: 'Failed to create zone',
    }
  }
}

export async function updateTableZone(input: UpdateTableZoneInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const zone = await prisma.tableZone.findUnique({
      where: { id: input.id },
      select: { storeId: true, branchId: true },
    })
    if (!zone) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโซน' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: zone.storeId,
      branchId: zone.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการแก้ไขโซน' }
    }

    const updated = await prisma.tableZone.update({
      where: { id: input.id },
      data: {
        name: input.name.trim(),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
      },
    })

    return {
      success: true,
      data: updated,
      messageTH: 'แก้ไขโซนสำเร็จ',
      messageEN: 'Zone updated successfully',
    }
  } catch (error) {
    console.error('Error updating table zone:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการแก้ไขโซน',
      messageEN: 'Failed to update zone',
    }
  }
}

export async function deleteTableZone({ id }: { id: string }) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const zone = await prisma.tableZone.findUnique({
      where: { id },
      select: { storeId: true, branchId: true },
    })
    if (!zone) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโซน' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: zone.storeId,
      branchId: zone.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการลบโซน' }
    }

    await prisma.tableZone.delete({
      where: { id },
    })

    return {
      success: true,
      messageTH: 'ลบโซนสำเร็จ',
      messageEN: 'Zone deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting table zone:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการลบโซน',
      messageEN: 'Failed to delete zone',
    }
  }
}

// ==========================================
// 2. Table Management Actions
// ==========================================

export async function getRestaurantTables({
  storeId,
  branchId,
  zoneId,
}: {
  storeId: string
  branchId?: string
  zoneId?: string
}) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, data: [] }
    }

    const tables = await prisma.restaurantTable.findMany({
      where: {
        storeId,
        ...(branchId ? { branchId } : {}),
        ...(zoneId ? { zoneId } : {}),
      },
      include: {
        zone: true,
        sessions: {
          where: {
            status: { in: [TableStatus.OCCUPIED, TableStatus.BILL_REQUESTED] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            orders: {
              where: {
                status: { notIn: ['CANCELLED'] },
              },
              include: {
                items: true,
              },
            },
          },
        },
      },
      orderBy: { tableNumber: 'asc' },
    })

    return { success: true, data: serializeDecimal(tables) }
  } catch (error) {
    console.error('Error fetching tables:', error)
    return { success: false, data: [] }
  }
}

export async function createRestaurantTable(input: CreateRestaurantTableInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: input.storeId,
      branchId: input.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการสร้างโต๊ะ' }
    }

    // Check duplicate table number in the same branch
    const existing = await prisma.restaurantTable.findFirst({
      where: {
        branchId: input.branchId,
        tableNumber: input.tableNumber.trim(),
      },
    })
    if (existing) {
      return {
        success: false,
        messageTH: `หมายเลขโต๊ะ "${input.tableNumber}" มีอยู่แล้วในสาขานี้`,
        messageEN: `Table number "${input.tableNumber}" already exists in this branch`,
      }
    }

    const table = await prisma.restaurantTable.create({
      data: {
        storeId: input.storeId,
        branchId: input.branchId,
        zoneId: input.zoneId || null,
        tableNumber: input.tableNumber.trim(),
        seats: input.seats ?? 4,
        status: TableStatus.AVAILABLE,
        qrCodeToken: crypto.randomUUID(),
      },
      include: { zone: true },
    })

    return {
      success: true,
      data: table,
      messageTH: 'สร้างโต๊ะสำเร็จ',
      messageEN: 'Table created successfully',
    }
  } catch (error) {
    console.error('Error creating table:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการสร้างโต๊ะ',
      messageEN: 'Failed to create table',
    }
  }
}

export async function updateRestaurantTable(input: UpdateRestaurantTableInput) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id: input.id },
      select: { storeId: true, branchId: true, tableNumber: true },
    })
    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: table.storeId,
      branchId: table.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการแก้ไขโต๊ะ' }
    }

    if (input.tableNumber && input.tableNumber.trim() !== table.tableNumber) {
      const duplicate = await prisma.restaurantTable.findFirst({
        where: {
          branchId: table.branchId,
          tableNumber: input.tableNumber.trim(),
          id: { not: input.id },
        },
      })
      if (duplicate) {
        return {
          success: false,
          messageTH: `หมายเลขโต๊ะ "${input.tableNumber}" มีอยู่แล้วในสาขานี้`,
          messageEN: `Table number "${input.tableNumber}" already exists`,
        }
      }
    }

    const updated = await prisma.restaurantTable.update({
      where: { id: input.id },
      data: {
        ...(input.tableNumber ? { tableNumber: input.tableNumber.trim() } : {}),
        ...(input.seats !== undefined ? { seats: input.seats } : {}),
        ...(input.zoneId !== undefined ? { zoneId: input.zoneId } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
      include: { zone: true },
    })

    return {
      success: true,
      data: updated,
      messageTH: 'แก้ไขโต๊ะสำเร็จ',
      messageEN: 'Table updated successfully',
    }
  } catch (error) {
    console.error('Error updating table:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการแก้ไขโต๊ะ',
      messageEN: 'Failed to update table',
    }
  }
}

export async function deleteRestaurantTable({ id }: { id: string }) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id },
      select: { storeId: true, branchId: true },
    })
    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: table.storeId,
      branchId: table.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการลบโต๊ะ' }
    }

    await prisma.restaurantTable.delete({
      where: { id },
    })

    return {
      success: true,
      messageTH: 'ลบโต๊ะสำเร็จ',
      messageEN: 'Table deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting table:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการลบโต๊ะ',
      messageEN: 'Failed to delete table',
    }
  }
}

export async function regenerateTableQRToken({ id }: { id: string }) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return { success: false, messageTH: 'กรุณาเข้าสู่ระบบ' }
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id },
      select: { storeId: true, branchId: true },
    })
    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId: userSession.id,
      storeId: table.storeId,
      branchId: table.branchId,
      permission: 'canViewOrders',
    })
    if (!authCheck.isAuthorized) {
      return { success: false, messageTH: 'ไม่มีสิทธิ์ในการจัดการโต๊ะ' }
    }

    const newToken = crypto.randomUUID()
    const updated = await prisma.restaurantTable.update({
      where: { id },
      data: { qrCodeToken: newToken },
    })

    return {
      success: true,
      data: updated,
      messageTH: 'สร้าง QR Code ใหม่สำเร็จ',
      messageEN: 'QR Code regenerated successfully',
    }
  } catch (error) {
    console.error('Error regenerating QR token:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการสร้าง QR Code ใหม่',
      messageEN: 'Failed to regenerate QR code',
    }
  }
}

// ==========================================
// 3. Table Session Actions (Open / Close)
// ==========================================

export async function openTableSession({
  tableId,
  guestCount = 1,
}: {
  tableId: string
  guestCount?: number
}) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId },
    })
    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะ' }
    }

    // Check if there is already an active session
    let session = await prisma.tableSession.findFirst({
      where: {
        tableId,
        status: { in: [TableStatus.OCCUPIED, TableStatus.BILL_REQUESTED] },
      },
    })

    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          tableId,
          storeId: table.storeId,
          branchId: table.branchId,
          sessionCode: crypto.randomUUID(),
          guestCount: Math.max(1, guestCount),
          status: TableStatus.OCCUPIED,
        },
      })
    }

    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: {
        status: TableStatus.OCCUPIED,
        currentSessionId: session.id,
      },
    })

    appEvents.publish(`table:${table.storeId}`, {
      type: 'TABLE_UPDATED',
      tableId,
      status: TableStatus.OCCUPIED,
    })

    return {
      success: true,
      data: session,
      messageTH: 'เปิดโต๊ะสำเร็จ',
      messageEN: 'Table opened successfully',
    }
  } catch (error) {
    console.error('Error opening table session:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการเปิดโต๊ะ',
      messageEN: 'Failed to open table',
    }
  }
}

export async function closeTableSession({ tableId }: { tableId: string }) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id: tableId },
    })
    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะ' }
    }

    const now = new Date()
    await prisma.tableSession.updateMany({
      where: {
        tableId,
        status: { in: [TableStatus.OCCUPIED, TableStatus.BILL_REQUESTED] },
      },
      data: {
        status: TableStatus.AVAILABLE,
        closedAt: now,
      },
    })

    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: {
        status: TableStatus.AVAILABLE,
        currentSessionId: null,
      },
    })

    appEvents.publish(`table:${table.storeId}`, {
      type: 'TABLE_UPDATED',
      tableId,
      status: TableStatus.AVAILABLE,
    })

    return {
      success: true,
      messageTH: 'ปิดโต๊ะสำเร็จ',
      messageEN: 'Table closed successfully',
    }
  } catch (error) {
    console.error('Error closing table session:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการปิดโต๊ะ',
      messageEN: 'Failed to close table',
    }
  }
}

// ==========================================
// 4. Customer Lookup by QR Token
// ==========================================

export async function getTableByQRToken(token: string) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { qrCodeToken: token },
      include: {
        zone: true,
        branch: {
          select: {
            id: true,
            name: true,
            openingHours: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            coverImage: true,
            primaryColor: true,
            customDomain: true,
          },
        },
        sessions: {
          where: {
            status: { in: [TableStatus.OCCUPIED, TableStatus.BILL_REQUESTED] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            orders: {
              where: {
                status: { notIn: ['CANCELLED'] },
              },
              include: {
                items: true,
              },
            },
          },
        },
      },
    })

    if (!table) {
      return { success: false, messageTH: 'ไม่พบข้อมูลโต๊ะอาหารนี้' }
    }

    return { success: true, data: serializeDecimal(table) }
  } catch (error) {
    console.error('Error getting table by QR token:', error)
    return { success: false, messageTH: 'เกิดข้อผิดพลาดในการโหลดข้อมูลโต๊ะ' }
  }
}
