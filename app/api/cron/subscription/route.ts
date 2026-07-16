import { NextResponse } from 'next/server'

import { PLAN_DETAILS } from '@/constants/plan'
import { Prisma } from '@/generated/prisma/client'
import { InvoiceStatus, Plan, SubStatus } from '@/generated/prisma/enums'
import { formatDate } from '@/utils/date'
import { calculatePlanPrice } from '@/utils/pricing'
import { addMonths } from 'date-fns'

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
      },
    })

    for (const invoice of overdueInvoices) {
      const sub = await prisma.subscription.findUnique({
        where: { storeId: invoice.storeId },
        select: { pendingPlanCycle: true },
      })

      const months = sub?.pendingPlanCycle ? parseInt(sub.pendingPlanCycle) : 12

      await prisma.$transaction([
        prisma.subscriptionInvoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.FAILED },
        }),
        prisma.store.update({
          where: { id: invoice.storeId },
          data: { plan: Plan.FREE },
        }),
        prisma.subscription.update({
          where: { storeId: invoice.storeId },
          data: {
            plan: Plan.FREE,
            pendingPlan: null,
            pendingPlanAt: null,
            pendingPlanCycle: null,
          },
        }),
        prisma.subscriptionInvoice.create({
          data: {
            storeId: invoice.storeId,
            plan: Plan.FREE,
            amount: new Prisma.Decimal(0),
            status: InvoiceStatus.PAID,
            paidAt: now,
            periodStart: now,
            periodEnd: addMonths(now, months),
            description:
              'เปลี่ยนเป็นแพลนเริ่มต้นใช้งานฟรี เนื่องจากค้างชำระค่าบริการ',
          },
        }),
      ])
    }

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: { lte: now },
        status: SubStatus.ACTIVE,
        plan: { not: Plan.FREE },
      },
    })

    for (const sub of expiringSubscriptions) {
      const billingCycle = sub.pendingPlanCycle || '1'
      const months = parseInt(billingCycle) || 1

      const nextPlan = sub.pendingPlan || sub.plan
      const nextEndDate = addMonths(new Date(sub.endDate), months)

      const { finalPrice } = calculatePlanPrice(
        PLAN_DETAILS[nextPlan].price.toString(),
        billingCycle,
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
            description: `ค่าบริการแพลน ${PLAN_DETAILS[nextPlan].name} (${billingCycle} เดือน) (รอบ ${formatDate(sub.endDate)} ถึง ${formatDate(nextEndDate)})`,
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
      processedOverdue: overdueInvoices.length,
      renewed: expiringSubscriptions.length,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
