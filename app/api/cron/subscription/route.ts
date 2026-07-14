import { NextResponse } from 'next/server'

import { PLAN_DETAILS } from '@/constants/plan'
import { Prisma } from '@/generated/prisma/client'
import { InvoiceStatus, StoreStatus, SubStatus } from '@/generated/prisma/enums'
import { formatDate } from '@/utils/date'
import { calculatePlanPrice } from '@/utils/pricing'
import { addMonths, differenceInMonths } from 'date-fns'

import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const now = new Date()

  try {
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const overdueInvoices = await prisma.subscriptionInvoice.findMany({
      where: {
        status: InvoiceStatus.UNPAID,
        createdAt: { lt: sevenDaysAgo },
        store: { status: { not: StoreStatus.SUSPENDED } },
      },
    })

    for (const invoice of overdueInvoices) {
      await prisma.store.update({
        where: { id: invoice.storeId },
        data: { status: StoreStatus.SUSPENDED },
      })
    }

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: { lte: now },
        status: SubStatus.ACTIVE,
      },
      include: {
        store: {
          include: {
            subscriptionInvoices: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    })

    for (const sub of expiringSubscriptions) {
      const billingCycle =
        sub.pendingPlanCycle ||
        differenceInMonths(
          new Date(sub.endDate),
          new Date(sub.startDate),
        ).toString()

      const monthsInCycle = parseInt(billingCycle) || 1

      const nextPlan = sub.pendingPlan || sub.plan
      const nextEndDate = addMonths(new Date(sub.endDate), monthsInCycle)

      const { finalPrice } = calculatePlanPrice(
        PLAN_DETAILS[nextPlan].price.toString(),
        monthsInCycle.toString(),
      )

      await prisma.$transaction([
        prisma.subscriptionInvoice.create({
          data: {
            storeId: sub.storeId,
            plan: nextPlan,
            amount: new Prisma.Decimal(finalPrice),
            status: InvoiceStatus.UNPAID,
            periodStart: sub.endDate,
            periodEnd: nextEndDate,
            description: `ค่าบริการแพลน ${PLAN_DETAILS[nextPlan].name} (รอบ ${formatDate(sub.endDate)} ถึง ${formatDate(nextEndDate)})`,
          },
        }),
        prisma.subscription.update({
          where: { id: sub.id },
          data: {
            plan: nextPlan,
            endDate: nextEndDate,
            pendingPlan: null,
            pendingPlanAt: null,
            pendingPlanCycle: null,
          },
        }),
        prisma.store.update({
          where: { id: sub.storeId },
          data: { plan: nextPlan },
        }),
      ])
    }

    return NextResponse.json({
      success: true,
      suspended: overdueInvoices.length,
      renewed: expiringSubscriptions.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
