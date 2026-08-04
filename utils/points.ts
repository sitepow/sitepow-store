import { Prisma } from '@/generated/prisma/client'

interface DeductPointsParams {
  tx: Prisma.TransactionClient
  customerId: string
  storeId: string
  usedPoints: number
}

interface RefundPointsParams {
  tx: Prisma.TransactionClient
  customerId: string
  storeId: string
  usedPoints: number
}

interface EarnPointsParams {
  tx: Prisma.TransactionClient
  customerId: string
  storeId: string
  earnedPoints: number
}

export async function deductCustomerPoints({
  tx,
  customerId,
  storeId,
  usedPoints,
}: DeductPointsParams) {
  if (!customerId || !storeId || !usedPoints || usedPoints <= 0) {
    return
  }

  await tx.customerStore.update({
    where: {
      customerId_storeId: {
        customerId,
        storeId,
      },
    },
    data: {
      rewardPoints: { decrement: usedPoints },
    },
  })
}

export async function refundCustomerPoints({
  tx,
  customerId,
  storeId,
  usedPoints,
}: RefundPointsParams) {
  if (!customerId || !storeId || !usedPoints || usedPoints <= 0) {
    return
  }

  await tx.customerStore.update({
    where: {
      customerId_storeId: {
        customerId,
        storeId,
      },
    },
    data: {
      rewardPoints: { increment: usedPoints },
    },
  })
}

export async function earnCustomerPoints({
  tx,
  customerId,
  storeId,
  earnedPoints,
}: EarnPointsParams) {
  if (!customerId || !storeId || !earnedPoints || earnedPoints <= 0) {
    return
  }

  await tx.customerStore.update({
    where: {
      customerId_storeId: {
        customerId,
        storeId,
      },
    },
    data: {
      rewardPoints: { increment: earnedPoints },
    },
  })
}
