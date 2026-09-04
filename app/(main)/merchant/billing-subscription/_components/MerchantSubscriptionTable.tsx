'use client'

import { useTranslations } from 'next-intl'

import {
  useCancelPendingPlanChange,
  useStoreSubscriptions,
} from '@/actions/hooks/subscription'
import { PLAN_DETAILS } from '@/constants/plan'
import { useSession } from '@/hooks/use-session'
import { formatDate } from '@/utils/date'
import {
  calculateMonthlyAverage,
  formatCurrency,
  getSubscriptionStatusInfo,
} from '@/utils/pricing'
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
  const t = useTranslations('merchant.billing')
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
            <TableHead>{t('columns.storeId')}</TableHead>
            <TableHead>{t('columns.storeInfo')}</TableHead>
            <TableHead>{t('columns.currentPlan')}</TableHead>
            <TableHead>{t('columns.monthlyFee')}</TableHead>
            <TableHead className="max-w-75">
              {t('columns.statusRemaining')}
            </TableHead>
            <TableHead>{t('columns.nextBilling')}</TableHead>
            <TableHead className="text-right">{t('columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoadingRow colSpan={6} />
          ) : subscriptions.length === 0 ? (
            <TableEmptyRow colSpan={7} title={t('emptySubscriptions')} />
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
                          <Badge variant="destructive">
                            {t('statusPastDue')}
                          </Badge>
                        )}
                        {isCanceled && (
                          <Badge variant="outline">{t('statusCanceled')}</Badge>
                        )}
                        {sub.pendingPlan && !isCanceled && (
                          <div className="flex flex-col gap-2">
                            <Badge variant="outline">
                              {t('pendingDowngrade', {
                                plan: PLAN_DETAILS[sub.pendingPlan].name,
                              })}
                              {sub.pendingPlanCycle &&
                                ` (${sub.pendingPlanCycle})`}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {t('effectiveInDays', {
                                days: daysUntilChange,
                                date: formatDate(sub.pendingPlanAt!),
                              })}
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
                              {t('cancelPlanChange')}
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
                        {t('perMonth')}
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
                            {t('gracePeriodRemaining')}
                          </span>
                          <span className="text-destructive font-semibold">
                            {t('daysUnit', { days: daysRemaining })}
                          </span>
                        </div>
                        <Progress value={progressValue} className="h-1" />
                      </div>
                    ) : sub.pendingPlan && sub.pendingPlanAt ? (
                      <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground text-sm">
                          {t('effectiveDate', {
                            date: formatDate(sub.pendingPlanAt),
                          })}
                        </span>
                      </div>
                    ) : isCanceled ? (
                      <span className="text-sm">
                        {t('usableUntil', { date: formatDate(sub.endDate) })}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {isCanceled ? t('statusCanceled') : t('statusActive')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t('remainingDays', { days: daysRemaining })}
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
