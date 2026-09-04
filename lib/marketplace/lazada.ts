import { MarketplacePlatform } from '@/generated/prisma/enums'
import axios from 'axios'
import crypto from 'crypto'

import { StockSyncItem, SyncResult } from './types'

const LAZADA_API_HOST = 'https://api.lazada.co.th/rest'

export interface LazadaConfig {
  appKey: string
  appSecret: string
  accessToken?: string
  sellerId?: string
  isSimulator?: boolean
}

export class LazadaClient {
  private config: LazadaConfig

  constructor(config: LazadaConfig) {
    this.config = config
  }

  private sign(apiPath: string, params: Record<string, any>): string {
    const keys = Object.keys(params).sort()
    let baseString = apiPath
    for (const key of keys) {
      baseString += `${key}${params[key]}`
    }
    return crypto
      .createHmac('sha256', this.config.appSecret)
      .update(baseString)
      .digest('hex')
      .toUpperCase()
  }

  async updateStock(item: StockSyncItem): Promise<SyncResult> {
    if (
      this.config.isSimulator ||
      !this.config.appKey ||
      !this.config.appSecret
    ) {
      return {
        success: true,
        platform: MarketplacePlatform.LAZADA,
        action: 'UPDATE_STOCK_SIMULATOR',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku || item.sku,
        payload: {
          ItemId: item.marketplaceItemId,
          SellerSku: item.marketplaceSku || item.sku,
          Quantity: item.quantity,
        },
        response: {
          simulated: true,
          message: 'Lazada simulator: stock updated successfully',
          stock: item.quantity,
          updatedAt: new Date().toISOString(),
        },
      }
    }

    const apiPath = '/product/price_quantity/update'
    const timestamp = Date.now().toString()

    const xmlPayload = `
      <Request>
        <Product>
          <Skus>
            <Sku>
              <ItemId>${item.marketplaceItemId}</ItemId>
              <SellerSku>${item.marketplaceSku || item.sku}</SellerSku>
              <Quantity>${item.quantity}</Quantity>
            </Sku>
          </Skus>
        </Product>
      </Request>
    `.trim()

    const params: Record<string, any> = {
      app_key: this.config.appKey,
      timestamp,
      sign_method: 'sha256',
      access_token: this.config.accessToken || '',
      payload: xmlPayload,
    }

    const signature = this.sign(apiPath, params)
    params.sign = signature

    try {
      const { data } = await axios.post(`${LAZADA_API_HOST}${apiPath}`, null, {
        params,
        timeout: 10000,
      })

      if (data.code && data.code !== '0') {
        return {
          success: false,
          platform: MarketplacePlatform.LAZADA,
          action: 'UPDATE_STOCK',
          itemsCount: 1,
          marketplaceItemId: item.marketplaceItemId,
          marketplaceSku: item.marketplaceSku,
          payload: { xml: xmlPayload },
          response: data,
          errorMessage: data.message || `Lazada Error code: ${data.code}`,
        }
      }

      return {
        success: true,
        platform: MarketplacePlatform.LAZADA,
        action: 'UPDATE_STOCK',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku,
        payload: { xml: xmlPayload },
        response: data,
      }
    } catch (error: any) {
      return {
        success: false,
        platform: MarketplacePlatform.LAZADA,
        action: 'UPDATE_STOCK',
        itemsCount: 1,
        marketplaceItemId: item.marketplaceItemId,
        marketplaceSku: item.marketplaceSku,
        payload: { xml: xmlPayload },
        errorMessage: error.response?.data?.message || error.message,
      }
    }
  }
}
