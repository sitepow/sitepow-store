import type { KitchenItemStatus, TableStatus } from '@/generated/prisma/enums'

export interface TableZoneWithCount {
  id: string
  storeId: string
  branchId: string
  name: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  _count?: {
    tables: number
  }
}

export interface RestaurantTableOrderItem {
  id: string
  title: string
  quantity: number
  price: number
  customerNote?: string | null
}

export interface RestaurantTableOrder {
  id: string
  orderNumber: string
  totalAmount: number | string
  items: RestaurantTableOrderItem[]
}

export interface RestaurantTableSession {
  id: string
  status: TableStatus
  guestCount?: number
  orders: RestaurantTableOrder[]
}

export interface RestaurantTableItem {
  id: string
  storeId: string
  branchId: string
  zoneId: string | null
  tableNumber: string
  seats: number
  status: TableStatus
  qrCodeToken: string
  currentSessionId: string | null
  createdAt: Date
  updatedAt: Date
  zone?: {
    id: string
    name: string
  } | null
  sessions?: RestaurantTableSession[]
}

export interface KitchenTicketItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  variantTitle: string
  productTitle?: string
  quantity: number
  price: number | string
  kitchenStatus: KitchenItemStatus
  image?: string | null
  customerNote?: string | null
}

export interface KitchenTicketOrder {
  id: string
  orderNumber: string
  createdAt: string | Date
  customerNote?: string | null
  table?: {
    id: string
    tableNumber: string
    zone?: {
      name: string
    } | null
  } | null
  items: KitchenTicketItem[]
}

export interface TableMenuVariant {
  id: string
  title: string
  price: number
  originalPrice?: number | null
  sku?: string | null
}

export interface TableMenuProduct {
  id: string
  title: string
  description?: string | null
  images: string[]
  productType: string
  categoryId?: string | null
  category?: {
    id: string
    name: string
  } | null
  variants: TableMenuVariant[]
}

export interface TableMenuCategory {
  id: string
  name: string
}

export interface TableMenuProductItem {
  id: string
  title: string
  description?: string | null
  categoryId?: string | null
  image: string
  variants: {
    id: string
    title: string
    price: number
    image?: string
  }[]
  defaultPrice: number
}

export interface TableMenuResponse {
  store: {
    id: string
    name: string
    slug?: string
    logo?: string | null
    coverImage?: string | null
    primaryColor?: string | null
    baseCurrency?: string | null
  }
  table: {
    id: string
    tableNumber: string
    seats: number
    status: TableStatus
    zoneName: string | null
    branchName: string
  }
  categories: TableMenuCategory[]
  products: TableMenuProductItem[]
}

export interface TableOrderItemSummary {
  id: string
  variantTitle: string
  quantity: number
  price: number
  kitchenStatus: KitchenItemStatus
  productTitle?: string
}

export interface ActiveTableOrder {
  id: string
  orderNumber: string
  totalAmount: number
  total?: number
  status: string
  createdAt: string | Date
  items: TableOrderItemSummary[]
}

export interface TableCartItem {
  tempId: string
  productId: string
  variantId: string
  title: string
  variantTitle: string
  unitPrice: number
  quantity: number
  customerNote?: string
  image?: string
}
