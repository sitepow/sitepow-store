import {
  MarketplaceConnectionStatus,
  MarketplacePlatform,
  MarketplaceSyncStatus,
} from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

import { FacebookMarketplaceClient } from './facebook'
import { LazadaClient } from './lazada'
import { ShopeeClient } from './shopee'
import { InboundMarketplaceOrder, SyncResult } from './types'

export async function syncVariantStockToAllMarketplaces(
  variantId: string,
  newQuantity: number,
  storeId?: string,
): Promise<SyncResult[]> {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: { select: { storeId: true, title: true } },
        marketplaceMappings: {
          include: {
            connection: true,
          },
        },
      },
    })

    if (!variant || variant.marketplaceMappings.length === 0) {
      return []
    }

    const effectiveStoreId = storeId || variant.product.storeId
    const activeMappings = variant.marketplaceMappings.filter(
      (m) =>
        m.autoSyncStock &&
        m.connection.isAutoSync &&
        m.connection.status === MarketplaceConnectionStatus.CONNECTED,
    )

    if (activeMappings.length === 0) {
      return []
    }

    const results: SyncResult[] = []

    for (const mapping of activeMappings) {
      const conn = mapping.connection
      let result: SyncResult

      const syncItem = {
        variantId: variant.id,
        sku: variant.sku,
        quantity: Math.max(0, newQuantity),
        price: Number(variant.price),
        marketplaceItemId: mapping.marketplaceItemId,
        marketplaceSku: mapping.marketplaceSku,
      }

      if (conn.platform === MarketplacePlatform.SHOPEE) {
        const client = new ShopeeClient({
          partnerId: conn.appKey || '',
          partnerKey: conn.appSecret || '',
          shopId: conn.shopId || '',
          accessToken: conn.accessToken || '',
          isSimulator: conn.isSimulator,
        })
        result = await client.updateStock(syncItem)
      } else if (conn.platform === MarketplacePlatform.LAZADA) {
        const client = new LazadaClient({
          appKey: conn.appKey || '',
          appSecret: conn.appSecret || '',
          accessToken: conn.accessToken || '',
          sellerId: conn.shopId || '',
          isSimulator: conn.isSimulator,
        })
        result = await client.updateStock(syncItem)
      } else if (conn.platform === MarketplacePlatform.FACEBOOK) {
        const client = new FacebookMarketplaceClient({
          catalogId: conn.shopId || '',
          accessToken: conn.accessToken || '',
          isSimulator: conn.isSimulator,
        })
        result = await client.updateStock(syncItem)
      } else {
        continue
      }

      results.push(result)

      await prisma.marketplaceSyncLog.create({
        data: {
          storeId: effectiveStoreId,
          connectionId: conn.id,
          platform: conn.platform,
          action: result.action,
          status: result.success
            ? MarketplaceSyncStatus.SUCCESS
            : MarketplaceSyncStatus.FAILED,
          itemsCount: 1,
          payload: result.payload,
          response: result.response,
          errorMessage: result.errorMessage,
        },
      })

      await prisma.marketplaceProductMapping.update({
        where: { id: mapping.id },
        data: {
          lastSyncedStock: result.success
            ? newQuantity
            : mapping.lastSyncedStock,
          lastSyncedAt: new Date(),
          syncError: result.success ? null : result.errorMessage,
        },
      })
    }

    return results
  } catch (error) {
    console.error('syncVariantStockToAllMarketplaces error:', error)
    return []
  }
}

export async function handleInboundMarketplaceOrder(
  order: InboundMarketplaceOrder,
): Promise<{ success: boolean; message: string; deductedCount: number }> {
  try {
    const connection = await prisma.marketplaceConnection.findFirst({
      where: {
        platform: order.platform,
        shopId: order.shopId,
        status: MarketplaceConnectionStatus.CONNECTED,
      },
      include: {
        store: { select: { id: true, name: true } },
      },
    })

    if (!connection) {
      return {
        success: false,
        message: `ไม่พบการเชื่อมต่อของร้านค้าสำหรับแพลตฟอร์ม ${order.platform} (Shop ID: ${order.shopId})`,
        deductedCount: 0,
      }
    }

    let targetBranchId = connection.defaultBranchId
    if (!targetBranchId) {
      const mainBranch = await prisma.branch.findFirst({
        where: { storeId: connection.storeId, isMain: true },
        select: { id: true },
      })
      targetBranchId = mainBranch?.id || null
    }

    if (!targetBranchId) {
      return {
        success: false,
        message: 'ร้านค้ายังไม่มีสาขาหลักสำหรับตัดสต็อก',
        deductedCount: 0,
      }
    }

    let deductedCount = 0

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const mapping = await tx.marketplaceProductMapping.findFirst({
          where: {
            connectionId: connection.id,
            OR: [
              { marketplaceSku: item.marketplaceSku },
              { marketplaceItemId: item.marketplaceItemId },
            ],
          },
          select: { variantId: true },
        })

        let variantId = mapping?.variantId

        if (!variantId) {
          const variantBySku = await tx.productVariant.findFirst({
            where: {
              sku: item.marketplaceSku,
              product: { storeId: connection.storeId },
            },
            select: { id: true },
          })
          variantId = variantBySku?.id
        }

        if (variantId) {
          await tx.productStock.upsert({
            where: {
              branchId_variantId: {
                branchId: targetBranchId!,
                variantId,
              },
            },
            update: {
              quantity: { decrement: item.quantity },
            },
            create: {
              branchId: targetBranchId!,
              variantId,
              quantity: -item.quantity,
            },
          })

          deductedCount += item.quantity
        }
      }

      await tx.marketplaceSyncLog.create({
        data: {
          storeId: connection.storeId,
          connectionId: connection.id,
          platform: order.platform,
          action: 'ORDER_DEDUCT',
          status: MarketplaceSyncStatus.SUCCESS,
          itemsCount: order.items.length,
          payload: order as any,
          response: {
            deductedItemsCount: deductedCount,
            orderId: order.orderId,
            status: order.status,
          },
        },
      })
    })

    return {
      success: true,
      message: `ตัดสต็อกสำเร็จ ${deductedCount} รายการจากคำสั่งซื้อ ${order.orderId}`,
      deductedCount,
    }
  } catch (error: any) {
    console.error('handleInboundMarketplaceOrder error:', error)
    return {
      success: false,
      message:
        error.message || 'เกิดข้อผิดพลาดในการตัดสต็อกคำสั่งซื้อจากมาร์เก็ตเพลส',
      deductedCount: 0,
    }
  }
}

export async function batchSyncConnectionProducts(
  connectionId: string,
): Promise<{ total: number; successful: number; failed: number }> {
  const connection = await prisma.marketplaceConnection.findUnique({
    where: { id: connectionId },
    include: {
      mappings: {
        include: {
          variant: {
            include: {
              stocks: true,
              product: { select: { storeId: true } },
            },
          },
        },
      },
    },
  })

  if (!connection) {
    throw new Error('ไม่พบการเชื่อมต่อ')
  }

  let successful = 0
  let failed = 0

  for (const mapping of connection.mappings) {
    const branchStock = connection.defaultBranchId
      ? mapping.variant.stocks.find(
          (s) => s.branchId === connection.defaultBranchId,
        )
      : mapping.variant.stocks[0]

    const qty = branchStock?.quantity ?? 0

    const results = await syncVariantStockToAllMarketplaces(
      mapping.variantId,
      qty,
      connection.storeId,
    )

    const connResult = results.find((r) => r.platform === connection.platform)
    if (connResult?.success) {
      successful++
    } else {
      failed++
    }
  }

  return {
    total: connection.mappings.length,
    successful,
    failed,
  }
}
