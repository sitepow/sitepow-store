import { MarketplacePlatform } from '@/generated/prisma/enums'
import axios from 'axios'
import crypto from 'crypto'

import { StockSyncItem, SyncResult } from './types'

const SHOPEE_API_HOST = 'https://partner.shopeemobile.com'

export interface ShopeeConfig {
  partnerId: string
  partnerKey: string
  shopId: string
  accessToken?: string
  isSimulator?: boolean
}

export class ShopeeClient {
  private config: ShopeeConfig

  constructor(config: ShopeeConfig) {
    this.config = config
  }

  private generateSign(path: string, timestamp: number): string {
    const { partnerId, partnerKey, accessToken = '', shopId } = this.config
    const baseString = `${partnerId}${path}${timestamp}${accessToken}${shopId}`
    return crypto
      .createHmac('sha256', partnerKey)
      .update(baseString)
      .digest('hex')
  }

  async updateStock(item: StockSyncItem): Promise<SyncResult> {
    if (
      this.config.isSimulator ||
      !this.config.partnerKey ||
      !this.config.partnerId
    ) {
      return {
        success: true,
        platform: MarketplacePlatform.SHOPEE,
        action: 'UPDATE_STOCK_SIMULATOR',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku || item.sku,
        payload: {
          item_id: item.marketplaceItemId,
          stock: item.quantity,
          sku: item.sku,
        },
        response: {
          simulated: true,
          message: 'Shopee simulator: stock updated successfully',
          stock: item.quantity,
          updatedAt: new Date().toISOString(),
        },
      }
    }

    const path = '/api/v2/product/update_stock'
    const timestamp = Math.floor(Date.now() / 1000)
    const sign = this.generateSign(path, timestamp)

    const url = `${SHOPEE_API_HOST}${path}?partner_id=${this.config.partnerId}&timestamp=${timestamp}&sign=${sign}&shop_id=${this.config.shopId}&access_token=${this.config.accessToken}`

    const payload = {
      item_id: Number(item.marketplaceItemId) || 0,
      stock_list: [
        {
          model_id: 0,
          seller_stock: [
            {
              location_id: '',
              stock: item.quantity,
            },
          ],
        },
      ],
    }

    try {
      const { data } = await axios.post(url, payload, { timeout: 10000 })
      if (data.error && data.error.length > 0) {
        return {
          success: false,
          platform: MarketplacePlatform.SHOPEE,
          action: 'UPDATE_STOCK',
          itemsCount: 1,
          marketplaceItemId: item.marketplaceItemId,
          marketplaceSku: item.marketplaceSku,
          payload,
          response: data,
          errorMessage: data.message || data.error,
        }
      }

      return {
        success: true,
        platform: MarketplacePlatform.SHOPEE,
        action: 'UPDATE_STOCK',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku,
        payload,
        response: data,
      }
    } catch (error: any) {
      return {
        success: false,
        platform: MarketplacePlatform.SHOPEE,
        action: 'UPDATE_STOCK',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku,
        payload,
        errorMessage: error.response?.data?.message || error.message,
      }
    }
  }
}
