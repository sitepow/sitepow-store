import { GetOrdersItem, ShippingAddressSnapshot } from '@/actions/sales/order/actions'

export type DocumentType =
  | 'RECEIPT' // ใบเสร็จรับเงิน
  | 'TAX_INVOICE_FULL' // ใบกำกับภาษี / ใบเสร็จรับเงิน (เต็มรูป)
  | 'TAX_INVOICE_ABBR' // ใบกำกับภาษีอย่างย่อ (ม.86/6 / สลิป 80mm)
  | 'INVOICE_BILL' // ใบแจ้งหนี้ / ใบวางบิล
  | 'DELIVERY_SHIPPING' // ใบส่งของ & ใบปะหน้ากล่องพัสดุ
  | 'PICKING_PACKING' // ใบจัดสินค้า / ใบหยิบสินค้า

export interface DocumentOptions {
  isCopy?: boolean // ต้นฉบับ vs สำเนา
  paperSize?: 'A4' | 'SLIP_80MM' // ขนาดกระดาษ
  showLogo?: boolean // แสดงโลโก้
  showSignatures?: boolean // แสดงช่องลงลายมือชื่อ
  customNote?: string // หมายเหตุเพิ่มเติม
}

export interface StoreDocumentInfo {
  name: string
  taxId?: string | null
  isVatRegistered?: boolean
  vatRate?: number
  address?: string | null
  phone?: string | null
  email?: string | null
  logo?: string | null
  branchCode?: string | null
  branchName?: string | null
}

export function extractStoreDocumentInfo(order: GetOrdersItem): StoreDocumentInfo {
  const store = order.store as {
    name?: string
    taxId?: string | null
    isVatRegistered?: boolean
    vatRate?: number | string
    logo?: string | null
    phone?: string | null
    email?: string | null
    branches?: Array<{
      name?: string
      isMain?: boolean
      address?: string | null
      subDistrict?: string | null
      district?: string | null
      province?: string | null
      postcode?: string | null
    }>
  } | null

  // Fallback to storeSnapshot if store relation wasn't loaded
  const snapshot = order.storeSnapshot as {
    name?: string
    taxId?: string | null
    isVatRegistered?: boolean
    vatRate?: number | string
    logo?: string | null
    phone?: string | null
    email?: string | null
  } | null

  const mainBranch = store?.branches?.find((b) => b.isMain) || store?.branches?.[0]

  const branchAddress = mainBranch
    ? [
        mainBranch.address,
        mainBranch.subDistrict ? `ต.${mainBranch.subDistrict}` : '',
        mainBranch.district ? `อ.${mainBranch.district}` : '',
        mainBranch.province ? `จ.${mainBranch.province}` : '',
        mainBranch.postcode,
      ]
        .filter(Boolean)
        .join(' ')
    : null

  return {
    name: store?.name || snapshot?.name || 'ร้านค้า',
    taxId: store?.taxId || snapshot?.taxId || null,
    isVatRegistered: Boolean(store?.isVatRegistered ?? snapshot?.isVatRegistered ?? false),
    vatRate: Number(store?.vatRate ?? snapshot?.vatRate ?? 7),
    address: branchAddress || 'ประเทศไทย',
    phone: store?.phone || snapshot?.phone || null,
    email: store?.email || snapshot?.email || null,
    logo: store?.logo || snapshot?.logo || null,
    branchCode: mainBranch?.isMain ? 'สำนักงานใหญ่ (Head Office)' : mainBranch?.name || 'สำนักงานใหญ่ (Head Office)',
    branchName: mainBranch?.name || 'สำนักงานใหญ่',
  }
}

export function extractCustomerDocumentInfo(order: GetOrdersItem) {
  const shippingAddr = (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  const directName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  const name =
    directName ||
    shippingAddr?.receiverName ||
    shippingAddr?.name ||
    'ลูกค้าทั่วไป (General Customer)'

  const phone = order.customer?.phone || shippingAddr?.phone || '-'
  const email = order.customer?.email || '-'

  const fullAddress = [
    shippingAddr?.addressLine,
    shippingAddr?.subDistrict ? `ต.${shippingAddr.subDistrict}` : '',
    shippingAddr?.district ? `อ.${shippingAddr.district}` : '',
    shippingAddr?.province ? `จ.${shippingAddr.province}` : '',
    shippingAddr?.postalCode,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    name,
    phone,
    email,
    address: fullAddress || '-',
    // Tax invoice customer info
    taxName: order.taxName || name,
    taxId: order.taxId || '-',
    taxBranchCode: order.taxBranchCode || 'สำนักงานใหญ่ (Head Office)',
    taxAddress: order.taxAddress || fullAddress || '-',
  }
}
