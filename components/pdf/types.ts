import { GetOrdersItem } from '@/actions/order'

export type OrderDocType =
  | 'receipt'
  | 'receipt-slip'
  | 'tax-invoice'
  | 'delivery-note'
  | 'shipping-label'
  | 'packing-slip'

export interface DocTypeInfo {
  id: OrderDocType
  label: string
  sublabel: string
  pageSize: 'A4' | 'Label' | 'Slip'
}

export const DOC_TYPES: Record<OrderDocType, DocTypeInfo> = {
  receipt: {
    id: 'receipt',
    label: 'ใบเสร็จรับเงิน',
    sublabel: 'Receipt (A4)',
    pageSize: 'A4',
  },
  'receipt-slip': {
    id: 'receipt-slip',
    label: 'ใบเสร็จอย่างย่อ',
    sublabel: 'Receipt Slip (80mm)',
    pageSize: 'Slip',
  },
  'tax-invoice': {
    id: 'tax-invoice',
    label: 'ใบกำกับภาษี',
    sublabel: 'Tax Invoice',
    pageSize: 'A4',
  },
  'delivery-note': {
    id: 'delivery-note',
    label: 'ใบส่งสินค้า',
    sublabel: 'Delivery Note',
    pageSize: 'A4',
  },
  'shipping-label': {
    id: 'shipping-label',
    label: 'ใบปะหน้าพัสดุ',
    sublabel: 'Shipping Label (100x150mm)',
    pageSize: 'Label',
  },
  'packing-slip': {
    id: 'packing-slip',
    label: 'ใบจัดสินค้า',
    sublabel: 'Packing Slip',
    pageSize: 'A4',
  },
}

export interface OrderDocComponentProps {
  order: GetOrdersItem
}

export interface StoreInfo {
  name: string
  logo?: string | null
  phone?: string | null
  email?: string | null
  taxId?: string | null
  address?: string | null
  domain?: string | null
}
