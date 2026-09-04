'use server'

import { revalidatePath } from 'next/cache'

import {
  MarketplaceConnectionStatus,
  MarketplacePlatform,
  MarketplaceSyncStatus,
  Prisma,
} from '@/generated/prisma/client'

import { getCurrentUser } from '@/lib/auth-server'
import {
  batchSyncConnectionProducts,
  handleInboundMarketplaceOrder,
  syncVariantStockToAllMarketplaces,
} from '@/lib/marketplace/sync-service'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface SaveMarketplaceConnectionInput {
  platform: MarketplacePlatform
  shopId: string
  shopName?: string
  appKey?: string
  appSecret?: string
  accessToken?: string
  isSimulator?: boolean
  defaultBranchId?: string
}

export async function getMarketplaceConnections(storeId: string) {
  const user = await getCurrentUser()
  if (!user?.id || !storeId) {
    return []
  }

  const authCheck = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewStoreSettings',
  })
  if (!authCheck.isAuthorized) {
    return []
  }

  return await prisma.marketplaceConnection.findMany({
    where: { storeId },
    include: {
      defaultBranch: { select: { id: true, name: true } },
      _count: { select: { mappings: true, syncLogs: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function saveMarketplaceConnection(
  storeId: string,
  input: SaveMarketplaceConnectionInput,
) {
  const user = await getCurrentUser()
  if (!user?.id || !storeId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  const authCheck = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canUpdateStoreSettings',
  })
  if (!authCheck.isAuthorized) {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
  }

  try {
    const existing = await prisma.marketplaceConnection.findFirst({
      where: {
        storeId,
        platform: input.platform,
      },
    })

    const status = input.isSimulator
      ? MarketplaceConnectionStatus.CONNECTED
      : input.accessToken || input.appKey
        ? MarketplaceConnectionStatus.CONNECTED
        : MarketplaceConnectionStatus.DISCONNECTED

    let connection
    if (existing) {
      connection = await prisma.marketplaceConnection.update({
        where: { id: existing.id },
        data: {
          shopId: input.shopId,
          shopName: input.shopName || `${input.platform} Store`,
          appKey: input.appKey,
          appSecret: input.appSecret,
          accessToken: input.accessToken,
          isSimulator: input.isSimulator ?? false,
          defaultBranchId: input.defaultBranchId || null,
          status,
        },
      })
    } else {
      connection = await prisma.marketplaceConnection.create({
        data: {
          storeId,
          platform: input.platform,
          shopId: input.shopId,
          shopName: input.shopName || `${input.platform} Store`,
          appKey: input.appKey,
          appSecret: input.appSecret,
          accessToken: input.accessToken,
          isSimulator: input.isSimulator ?? false,
          defaultBranchId: input.defaultBranchId || null,
          status,
        },
      })
    }

    revalidatePath('/merchant/settings')
    return {
      success: true,
      message: `บันทึกการเชื่อมต่อ ${input.platform} เรียบร้อยแล้ว`,
      data: connection,
    }
  } catch (error: any) {
    console.error('saveMarketplaceConnection error:', error)
    return { success: false, message: error.message || 'บันทึกล้มเหลว' }
  }
}

export async function toggleMarketplaceAutoSync(
  connectionId: string,
  isAutoSync: boolean,
) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  try {
    await prisma.marketplaceConnection.update({
      where: { id: connectionId },
      data: { isAutoSync },
    })

    return {
      success: true,
      message: `อัปเดตระบบ Auto-Sync เป็น ${isAutoSync ? 'เปิด' : 'ปิด'} สำเร็จ`,
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'เกิดข้อผิดพลาด' }
  }
}

export async function disconnectMarketplace(connectionId: string) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  try {
    await prisma.marketplaceConnection.update({
      where: { id: connectionId },
      data: {
        status: MarketplaceConnectionStatus.DISCONNECTED,
        accessToken: null,
        refreshToken: null,
      },
    })

    return { success: true, message: 'ยกเลิกการเชื่อมต่อเรียบร้อยแล้ว' }
  } catch (error: any) {
    return { success: false, message: error.message || 'เกิดข้อผิดพลาด' }
  }
}

export async function getMarketplaceMappings(
  storeId: string,
  connectionId?: string,
) {
  const user = await getCurrentUser()
  if (!user?.id || !storeId) {
    return []
  }

  const whereClause: Prisma.MarketplaceProductMappingWhereInput = {
    connection: { storeId },
  }
  if (connectionId) {
    whereClause.connectionId = connectionId
  }

  return await prisma.marketplaceProductMapping.findMany({
    where: whereClause,
    include: {
      connection: {
        select: {
          id: true,
          platform: true,
          shopName: true,
          defaultBranchId: true,
        },
      },
      variant: {
        select: {
          id: true,
          title: true,
          sku: true,
          price: true,
          image: true,
          product: { select: { title: true } },
          stocks: {
            select: {
              quantity: true,
              branchId: true,
              branch: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function autoMapProductsBySku(
  storeId: string,
  connectionId: string,
) {
  const user = await getCurrentUser()
  if (!user?.id || !storeId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  try {
    const connection = await prisma.marketplaceConnection.findUnique({
      where: { id: connectionId },
    })
    if (!connection || connection.storeId !== storeId) {
      return { success: false, message: 'ไม่พบการเชื่อมต่อของร้านค้า' }
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        product: { storeId },
        sku: { not: '' },
      },
      select: { id: true, sku: true, price: true },
    })

    let mappedCount = 0

    for (const v of variants) {
      const existing = await prisma.marketplaceProductMapping.findUnique({
        where: {
          connectionId_variantId: {
            connectionId,
            variantId: v.id,
          },
        },
      })

      if (!existing) {
        await prisma.marketplaceProductMapping.create({
          data: {
            connectionId,
            variantId: v.id,
            marketplaceItemId: `MP-${v.sku}`,
            marketplaceSku: v.sku,
            autoSyncStock: true,
            autoSyncPrice: false,
          },
        })
        mappedCount++
      }
    }

    return {
      success: true,
      message: `จับคู่สินค้าอัตโนมัติสำเร็จ ${mappedCount} รายการ`,
      mappedCount,
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'จับคู่สินค้าล้มเหลว' }
  }
}

export async function saveProductMapping(data: {
  connectionId: string
  variantId: string
  marketplaceItemId: string
  marketplaceSku: string
  autoSyncStock?: boolean
  autoSyncPrice?: boolean
}) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  try {
    const mapping = await prisma.marketplaceProductMapping.upsert({
      where: {
        connectionId_variantId: {
          connectionId: data.connectionId,
          variantId: data.variantId,
        },
      },
      update: {
        marketplaceItemId: data.marketplaceItemId,
        marketplaceSku: data.marketplaceSku,
        autoSyncStock: data.autoSyncStock ?? true,
        autoSyncPrice: data.autoSyncPrice ?? false,
      },
      create: {
        connectionId: data.connectionId,
        variantId: data.variantId,
        marketplaceItemId: data.marketplaceItemId,
        marketplaceSku: data.marketplaceSku,
        autoSyncStock: data.autoSyncStock ?? true,
        autoSyncPrice: data.autoSyncPrice ?? false,
      },
    })

    return {
      success: true,
      message: 'บันทึกการจับคู่สินค้าสำเร็จ',
      data: mapping,
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'เกิดข้อผิดพลาด' }
  }
}

export async function deleteProductMapping(mappingId: string) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  try {
    await prisma.marketplaceProductMapping.delete({
      where: { id: mappingId },
    })
    return { success: true, message: 'ลบการจับคู่สินค้าเรียบร้อยแล้ว' }
  } catch (error: any) {
    return { success: false, message: error.message || 'ลบล้มเหลว' }
  }
}

export async function triggerManualSync(
  connectionId: string,
  variantId?: string,
) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  try {
    const connection = await prisma.marketplaceConnection.findUnique({
      where: { id: connectionId },
    })
    if (!connection) {
      return { success: false, message: 'ไม่พบการเชื่อมต่อ' }
    }

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { stocks: true },
      })
      if (!variant) {
        return { success: false, message: 'ไม่พบสินค้า' }
      }

      const branchStock = connection.defaultBranchId
        ? variant.stocks.find((s) => s.branchId === connection.defaultBranchId)
        : variant.stocks[0]

      const qty = branchStock?.quantity ?? 0
      const results = await syncVariantStockToAllMarketplaces(
        variantId,
        qty,
        connection.storeId,
      )

      const targetResult = results.find(
        (r) => r.platform === connection.platform,
      )
      return {
        success: targetResult ? targetResult.success : true,
        message: targetResult?.success
          ? `ซิงค์สต็อกสำเร็จ (${qty} ชิ้น)`
          : targetResult?.errorMessage || 'ซิงค์สต็อกล้มเหลว',
      }
    } else {
      const batchResult = await batchSyncConnectionProducts(connectionId)
      return {
        success: true,
        message: `ซิงค์สต็อกสำเร็จ ${batchResult.successful} / ${batchResult.total} รายการ`,
        data: batchResult,
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการซิงค์',
    }
  }
}

export async function getMarketplaceSyncLogs(
  storeId: string,
  page: number = 1,
  limit: number = 20,
) {
  const user = await getCurrentUser()
  if (!user?.id || !storeId) {
    return { data: [], total: 0 }
  }

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    prisma.marketplaceSyncLog.findMany({
      where: { storeId },
      include: {
        connection: {
          select: {
            platform: true,
            shopName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.marketplaceSyncLog.count({
      where: { storeId },
    }),
  ])

  return { data, total, page, limit }
}

export async function simulateInboundOrder(
  storeId: string,
  connectionId: string,
  sku: string,
  quantity: number = 1,
) {
  const user = await getCurrentUser()
  if (!user?.id) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  const connection = await prisma.marketplaceConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection || connection.storeId !== storeId) {
    return { success: false, message: 'ไม่พบการเชื่อมต่อของร้านค้า' }
  }

  const simulatedOrder = {
    orderId: `SIM-${Date.now().toString().slice(-6)}`,
    platform: connection.platform,
    shopId: connection.shopId || 'SIMULATOR-SHOP',
    items: [
      {
        marketplaceItemId: `MP-${sku}`,
        marketplaceSku: sku,
        quantity,
        price: 990,
      },
    ],
    totalAmount: 990 * quantity,
    customerName: 'คุณสมชาย (Shopee/Lazada Test Customer)',
    status: 'PAID',
  }

  return await handleInboundMarketplaceOrder(simulatedOrder)
}
