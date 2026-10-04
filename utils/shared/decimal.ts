import { Prisma } from '@/generated/prisma/client'

export type DecimalToNumber<T> = T extends Prisma.Decimal
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? Array<DecimalToNumber<U>>
      : T extends object
        ? { [K in keyof T]: DecimalToNumber<T[K]> }
        : T

export const serializeDecimal = <T>(data: T): DecimalToNumber<T> => {
  if (data instanceof Prisma.Decimal) {
    return data.toNumber() as DecimalToNumber<T>
  }

  if (data instanceof Date || data === null) {
    return data as DecimalToNumber<T>
  }

  if (Array.isArray(data)) {
    return data.map(serializeDecimal) as DecimalToNumber<T>
  }

  if (typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        serializeDecimal(value),
      ]),
    ) as DecimalToNumber<T>
  }

  return data as DecimalToNumber<T>
}
