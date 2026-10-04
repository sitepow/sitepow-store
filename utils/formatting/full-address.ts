export interface AddressLike {
  addressLine?: string | null
  subDistrict?: string | null
  district?: string | null
  province?: string | null
  postalCode?: string | null
}

export function formatFullAddress(address?: AddressLike | null): string {
  if (!address) {
    return ''
  }

  return [
    address.addressLine,
    address.subDistrict,
    address.district,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(' ')
}
