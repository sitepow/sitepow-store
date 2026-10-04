'use client'

import {
  useCancelPendingPlanChange,
  useStoreSubscriptions,
} from '@/actions/billing/subscription/hooks'
import { PLAN_DETAILS } from '@/constants/billing/plan'
import { useSession } from '@/hooks/use-session'
import { formatDate } from '@/utils/formatting/date'
import { formatCurrency } from '@/utils/formatting/number'
import { calculateMonthlyAverage, getSubscriptionStatusInfo } from '@/utils/billing/subscription-pricing'
import { IconAlertTriangle, IconX } from '@tabler/icons-react'
import { differenceInDays } from 'date-fns'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const cancelPendingMutation = useCancelPendingPlanChange()

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสร้านค้า</TableHead>
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
              colSpan={7}
              title="ไม่พบข้อมูลแพลนบริการของร้านค้า"
            />
          ) : (
            subscriptions.map((sub) => {
              const plan = PLAN_DETAILS[sub.store.plan]
              const { isPastDue, isCanceled, daysRemaining, progressValue } =
                getSubscriptionStatusInfo(sub)
              const monthlyAverage = calculateMonthlyAverage(sub, plan.price)
              const daysUntilChange = sub.pendingPlanAt
                ? Math.max(
                    0,
                    differenceInDays(new Date(sub.pendingPlanAt), new Date()),
                  )
                : 0
              return (
                <TableRow key={sub.id}>
                  <TableCell>{sub.store?.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1.5">
                      <Badge variant="outline">{sub.store.name}</Badge>
                      <div className="flex items-center gap-1.5">
                        {isPastDue && (
                          <Badge variant="destructive">เกินกำหนดชำระ</Badge>
                        )}
                        {isCanceled && (
                          <Badge variant="outline">ยกเลิกแล้ว</Badge>
                        )}
                        {sub.pendingPlan && !isCanceled && (
                          <div className="flex flex-col gap-2">
                            <Badge variant="outline">
                              รอลดแพลนเป็น →{' '}
                              {PLAN_DETAILS[sub.pendingPlan].name}
                              {sub.pendingPlanCycle &&
                                ` (${sub.pendingPlanCycle})`}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              มีผลในอีก {daysUntilChange} วัน (วันที่{' '}
                              {formatDate(sub.pendingPlanAt!)})
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-fit"
                              onClick={() =>
                                cancelPendingMutation.mutate(sub.store.id)
                              }
                              disabled={cancelPendingMutation.isPending}
                            >
                              <IconX size={14} className="mr-1" />{' '}
                              ยกเลิกการเปลี่ยนแพลน
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(monthlyAverage)}{' '}
                      <span className="text-muted-foreground text-xs">
                        / เดือน
                      </span>
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
                      <span className="text-sm">
                        ใช้งานได้ถึง {formatDate(sub.endDate)}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {isCanceled ? 'ยกเลิกแล้ว' : 'ใช้งานปกติ'}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          คงเหลือ {daysRemaining} วัน
                        </span>
                      </div>
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
                    <ChangePlanDialog
                      storeId={sub.store.id}
                      currentPlan={sub.store.plan}
                    />
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
