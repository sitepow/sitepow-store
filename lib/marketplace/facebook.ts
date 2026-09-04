import { MarketplacePlatform } from '@/generated/prisma/enums'
import axios from 'axios'

import { StockSyncItem, SyncResult } from './types'

const META_GRAPH_HOST = 'https://graph.facebook.com/v19.0'

export interface FacebookConfig {
  catalogId: string
  accessToken: string
  pageId?: string
  isSimulator?: boolean
}

export class FacebookMarketplaceClient {
  private config: FacebookConfig

  constructor(config: FacebookConfig) {
    this.config = config
  }

  async updateStock(item: StockSyncItem): Promise<SyncResult> {
    if (
      this.config.isSimulator ||
      !this.config.catalogId ||
      !this.config.accessToken
    ) {
      return {
        success: true,
        platform: MarketplacePlatform.FACEBOOK,
        action: 'UPDATE_STOCK_SIMULATOR',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku || item.sku,
        payload: {
          catalog_id: item.marketplaceItemId,
          retailer_id: item.marketplaceSku || item.sku,
          inventory: item.quantity,
          availability: item.quantity > 0 ? 'in stock' : 'out of stock',
        },
        response: {
          simulated: true,
          message: 'Facebook Marketplace simulator: catalog inventory updated',
          inventory: item.quantity,
          updatedAt: new Date().toISOString(),
        },
      }
    }

    const retailerId = item.marketplaceSku || item.sku
    const url = `${META_GRAPH_HOST}/${this.config.catalogId}/batch`

    const payload = {
      requests: [
        {
          method: 'UPDATE',
          retailer_id: retailerId,
          data: {
            availability: item.quantity > 0 ? 'in stock' : 'out of stock',
            inventory: item.quantity,
          },
        },
      ],
    }

    try {
      const { data } = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      return {
        success: true,
        platform: MarketplacePlatform.FACEBOOK,
        action: 'UPDATE_STOCK',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: retailerId,
        payload,
        response: data,
      }
    } catch (error: any) {
      return {
        success: false,
        platform: MarketplacePlatform.FACEBOOK,
        action: 'UPDATE_STOCK',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: retailerId,
        payload,
        errorMessage: error.response?.data?.error?.message || error.message,
      }
    }
  }
}
