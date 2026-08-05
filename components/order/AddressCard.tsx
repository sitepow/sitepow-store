import { formatPromptPay } from '@/utils/slip'
import { IconMapPin } from '@tabler/icons-react'

export interface ShippingAddressSnapshot {
  name?: string
  receiverName?: string
  phone?: string
  addressLine?: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
}

interface OrderAddressCardProps {
  address: ShippingAddressSnapshot | null
}

export function OrderAddressCard({ address }: OrderAddressCardProps) {
  if (!address) {
    return null
  }

  const fullAddress = [
    address.addressLine,
    address.subDistrict,
    address.district,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-1.5 rounded-lg border p-3 text-sm">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
        <IconMapPin size={15} /> ที่อยู่จัดส่ง (Shipping Address)
      </div>
      <div className="font-medium">
        {address.receiverName || address.name}{' '}
        {address.phone && `(${formatPromptPay(address.phone)})`}
      </div>
      <div className="text-muted-foreground text-xs leading-relaxed">
        {fullAddress}
      </div>
    </div>
  )
}
