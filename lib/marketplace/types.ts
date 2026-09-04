import {
  MarketplacePlatform,
  MarketplaceSyncStatus,
} from '@/generated/prisma/enums'

export interface MarketplaceCredentials {
  platform: MarketplacePlatform
  shopId?: string
  shopName?: string
  appKey?: string
  appSecret?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: Date
  isSimulator?: boolean
  defaultBranchId?: string
  metadata?: Record<string, any>
}

export interface StockSyncItem {
  variantId: string
  sku: string
  quantity: number
  price?: number
  marketplaceItemId?: string
  marketplaceSku?: string
}

export interface SyncResult {
  success: boolean
  platform: MarketplacePlatform
  action: string
  itemsCount: number
  marketplaceItemId?: string
  marketplaceSku?: string
  payload?: any
  response?: any
  errorMessage?: string
}

export interface InboundMarketplaceOrder {
  orderId: string
  platform: MarketplacePlatform
  shopId: string
  items: Array<{
    marketplaceItemId: string
    marketplaceSku: string
    quantity: number
    price: number
  }>
  totalAmount: number
  customerName?: string
  status: string
}
