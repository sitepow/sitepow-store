import { Prisma } from '@/generated/prisma/client'
import { DecimalToNumber } from '@/utils/decimal'

export type ProductWithRelations = DecimalToNumber<
  Prisma.ProductGetPayload<{
    include: {
      variants: { include: { stocks: true; digitalItems: true } }
      addons: true
      images: true
      tags: true
    }
  }>
>
