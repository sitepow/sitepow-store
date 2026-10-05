export interface AddressLike {
  addressLine?: string | null
  address?: string | null
  subDistrict?: string | null
  district?: string | null
  province?: string | null
  postalCode?: string | null
  postcode?: string | null
}

export function formatFullAddress(address?: AddressLike | null): string {
  if (!address) {
    return ''
  }

  return [
    address.addressLine || address.address,
    address.subDistrict,
    address.district,
    address.province,
    address.postalCode || address.postcode,
  ]
    .filter(Boolean)
    .join(' ')
}
