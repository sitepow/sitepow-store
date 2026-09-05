import { GetOrdersItem, ShippingAddressSnapshot } from '@/actions/order'
import { formatFullAddress } from '@/utils/address'

import { StoreInfo } from './types'

export function getStoreInfoFromOrder(order: GetOrdersItem): StoreInfo {
  const storeData = (order as any).store || {}
  const storeSnapshot = (order.storeSnapshot as any) || {}

  const name =
    storeData.name ||
    storeSnapshot.name ||
    (order as any).resellerAgreement?.resellerStore?.name ||
    ''

  const logo = storeData.logo || storeSnapshot.logo || null
  const phone = storeData.phone || storeSnapshot.phone || null
  const email = storeData.email || storeSnapshot.email || null
  const taxId = storeData.taxId || storeSnapshot.taxId || null
  const address =
    storeData.address || storeSnapshot.address || order.items?.[0]?.branch?.name
      ? [
          order.items?.[0]?.branch?.name,
          order.items?.[0]?.branch?.district,
          order.items?.[0]?.branch?.province,
        ]
          .filter(Boolean)
          .join(' ')
      : null
  const domain = storeData.slug || storeSnapshot.slug || null

  return {
    name,
    logo,
    phone,
    email,
    taxId,
    address,
    domain,
  }
}

export function getCustomerInfoFromOrder(order: GetOrdersItem) {
  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  const registeredName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(' ')

  const resellerInfo = (
    order as {
      resellerAgreement?: {
        resellerStore?: { name?: string }
        resellerUser?: { name?: string; email?: string }
      }
    }
  ).resellerAgreement

  const name =
    shippingAddr?.receiverName ||
    shippingAddr?.name ||
    registeredName ||
    resellerInfo?.resellerStore?.name ||
    resellerInfo?.resellerUser?.name ||
    order.taxName ||
    order.customer?.email ||
    ''

  const phone = shippingAddr?.phone || order.customer?.phone || '-'
  const email =
    order.customer?.email || resellerInfo?.resellerUser?.email || '-'
  const fullAddress = formatFullAddress(shippingAddr) || '-'

  return {
    name,
    phone,
    email,
    fullAddress,
    shippingAddr,
  }
}
