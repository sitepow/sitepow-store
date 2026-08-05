import { OrderItemInput } from './types'

export function calculateOrderDimensions(
  items: OrderItemInput[],
  variantMap: Map<
    string,
    {
      weight?: number | null
      width?: number | null
      height?: number | null
      length?: number | null
    }
  >,
) {
  let totalWeight = 0
  let maxWidth = 0
  let maxHeight = 0
  let maxLength = 0

  items.forEach((item) => {
    const v = variantMap.get(item.variantId)
    if (v) {
      if (v.weight) {
        totalWeight += Number(v.weight) * item.quantity
      }

      if (v.width && Number(v.width) > maxWidth) {
        maxWidth = Number(v.width)
      }

      if (v.height && Number(v.height) > maxHeight) {
        maxHeight = Number(v.height)
      }

      if (v.length && Number(v.length) > maxLength) {
        maxLength = Number(v.length)
      }
    }
  })

  return {
    totalWeight: totalWeight > 0 ? totalWeight : null,
    width: maxWidth > 0 ? maxWidth : null,
    height: maxHeight > 0 ? maxHeight : null,
    length: maxLength > 0 ? maxLength : null,
  }
}
