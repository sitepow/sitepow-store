'use client'

import {
  useCancelSubscription,
  useStoreSubscriptions,
} from '@/actions/hooks/subscription'
import { PLAN_DETAILS } from '@/config/planDetails'
import { Plan, SubStatus } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconAlertTriangle } from '@tabler/icons-react'
import { differenceInDays } from 'date-fns'

import { CancelSubscriptionButton } from '@/components/CancelSubscriptionButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ChangePlanDialog } from './ChangePlanDialog'

export function MerchantSubscriptionTable() {
  const { user } = useSession()
  const { data: subscriptions = [], isLoading } = useStoreSubscriptions(
    user?.id ?? '',
  )
  const cancelSubscriptionMutation = useCancelSubscription()

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ข้อมูลร้านค้า</TableHead>
            <TableHead>แพลนปัจจุบัน</TableHead>
            <TableHead>ค่าบริการ / เดือน</TableHead>
            <TableHead className="max-w-75">สถานะและระยะเวลาคงเหลือ</TableHead>
            <TableHead>รอบชำระถัดไป</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoadingRow colSpan={6} />
          ) : subscriptions.length === 0 ? (
            <TableEmptyRow
              colSpan={6}
              title="ไม่พบข้อมูลแพลนบริการของร้านค้า"
            />
          ) : (
            subscriptions.map((sub) => {
              const plan = PLAN_DETAILS[sub.store.plan]
              const isPastDue = sub.status === SubStatus.PAST_DUE
              const isCanceled = sub.status === SubStatus.CANCELED

              const totalDays = differenceInDays(
                new Date(sub.endDate),
                new Date(sub.startDate),
              )
              const daysRemaining = Math.max(
                0,
                differenceInDays(new Date(sub.endDate), new Date()),
              )
              const progressValue =
                totalDays > 0 ? (daysRemaining / totalDays) * 100 : 0

              return (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex flex-col space-y-1.5">
                      <span className="font-medium">{sub.store.name}</span>
                      <div className="flex items-center gap-1.5">
                        {isPastDue && (
                          <Badge variant="destructive">เกินกำหนดชำระ</Badge>
                        )}
                        {isCanceled && (
                          <Badge variant="secondary">ยกเลิกแล้ว</Badge>
                        )}
                        {sub.pendingPlan && !isCanceled && (
                          <Badge variant="outline">
                            รอลดแพลน → {PLAN_DETAILS[sub.pendingPlan].name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{plan.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(plan.price)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-75">
                    {isPastDue ? (
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center gap-1 text-sm">
                          <IconAlertTriangle
                            size={16}
                            className="text-destructive"
                          />
                          <span className="text-muted-foreground">
                            ระยะเวลาผ่อนผันคงเหลือ
                          </span>
                          <span className="text-destructive font-semibold">
                            {daysRemaining} วัน
                          </span>
                        </div>
                        <Progress value={progressValue} className="h-1" />
                      </div>
                    ) : sub.pendingPlan && sub.pendingPlanAt ? (
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground text-sm">
                          มีผลวันที่{' '}
                          <span className="text-foreground font-medium">
                            {formatDate(sub.pendingPlanAt)}
                          </span>
                        </span>
                      </div>
                    ) : isCanceled ? (
                      <span className="text-muted-foreground text-sm">
                        ใช้งานได้ถึง {formatDate(sub.endDate)}
                      </span>
                    ) : (
                      <span className="text-sm opacity-60">ปกติ</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        isPastDue ? 'text-destructive font-medium' : 'text-sm'
                      }
                    >
                      {isCanceled ? '-' : formatDate(sub.endDate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {sub.store.plan !== Plan.FREE && !isCanceled && (
                        <CancelSubscriptionButton
                          isPending={cancelSubscriptionMutation.isPending}
                          onCancel={() =>
                            cancelSubscriptionMutation.mutate(sub.store.id)
                          }
                        />
                      )}
                      <ChangePlanDialog
                        storeId={sub.store.id}
                        currentPlan={sub.store.plan}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
