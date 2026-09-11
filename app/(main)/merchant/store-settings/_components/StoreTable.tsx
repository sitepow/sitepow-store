'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useDeleteStore, useStores } from '@/actions/hooks/store'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/constants/plan'
import { SettingsTab } from '@/constants/settings'
import { StoreStatus } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { getSubscriptionStatusInfo } from '@/utils/pricing'
import {
  IconAlertTriangle,
  IconCreditCard,
  IconDotsVertical,
  IconExternalLink,
  IconHierarchy2,
  IconPackage,
  IconSettings,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react'

import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function StoreRowActions({
  storeId,
  onDelete,
}: {
  storeId: string
  onDelete: () => void
}) {
  const t = useTranslations('merchant.stores.actions')
  const router = useRouter()
  const { setSelectedStoreId } = useStoreFilter()

  const {
    canUpdateStore,
    canViewBranches,
    canViewSubscription,
    canViewProducts,
    canDeleteStore,
  } = useEmployeePermission(storeId)

  const hasGeneralActions =
    canUpdateStore || canViewBranches || canViewSubscription || canViewProducts

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-lg">
            <IconDotsVertical size={18} />
            <span className="sr-only">{t('openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canUpdateStore && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedStoreId(storeId)
                router.push('/merchant/settings')
              }}
            >
              <IconSettings size={16} className="mr-2" />
              <span>{t('settings')}</span>
            </DropdownMenuItem>
          )}
          {canUpdateStore && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedStoreId(storeId)
                router.push(`/merchant/settings?tab=${SettingsTab.DOMAIN}`)
              }}
            >
              <IconWorld size={16} className="mr-2" />
              <span>{t('domain')}</span>
            </DropdownMenuItem>
          )}
          {canViewBranches && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedStoreId(storeId)
                router.push('/merchant/organization-branches')
              }}
            >
              <IconHierarchy2 size={16} className="mr-2" />
              <span>{t('branches')}</span>
            </DropdownMenuItem>
          )}
          {canViewSubscription && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedStoreId(storeId)
                router.push('/merchant/billing-subscription')
              }}
            >
              <IconCreditCard size={16} className="mr-2" />
              <span>{t('billing')}</span>
            </DropdownMenuItem>
          )}
          {canViewProducts && (
            <DropdownMenuItem
              onClick={() => {
                setSelectedStoreId(storeId)
                router.push('/merchant/store-settings/products')
              }}
            >
              <IconPackage size={16} className="mr-2" />
              <span>{t('products')}</span>
            </DropdownMenuItem>
          )}
          {canDeleteStore && (
            <>
              {hasGeneralActions && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <IconTrash size={16} className="mr-2" />
                <span>{t('delete')}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function StoreTable() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.stores')
  const [page, setPage] = useState(1)

  const { data: { data: stores = [], meta } = {}, isLoading } = useStores({
    page,
  })
  const deleteStoreMutation = useDeleteStore()

  return (
    <div
      className="space-y-4"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columns.id')}</TableHead>
              <TableHead>{t('columns.name')}</TableHead>
              <TableHead>{t('columns.plan')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.subscriptionRemaining')}</TableHead>
              <TableHead>{t('columns.features')}</TableHead>
              <TableHead>{t('columns.createdAt')}</TableHead>
              <TableHead className="text-right">
                {t('columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && stores.length === 0 && (
              <TableLoadingRow colSpan={8} />
            )}
            {!isLoading && stores.length === 0 && (
              <TableEmptyRow colSpan={8} title={t('empty')} />
            )}
            {stores.length !== 0 &&
              stores.map((store) => {
                const isActive = store.status === StoreStatus.ACTIVE
                const isMaintenance = store.status === StoreStatus.MAINTENANCE

                const formattedDate = store.createdAt
                  ? formatDateTime(store.createdAt)
                  : '-'

                const { isPastDue, isCanceled, daysRemaining, progressValue } =
                  getSubscriptionStatusInfo(store.subscription)

                return (
                  <TableRow key={store.id}>
                    <TableCell>{store.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{store.name}</span>
                        <a
                          href={`https://${store.slug}.sitepow.store`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className=""
                        >
                          <div className="hover:text-primary flex items-center gap-1.5">
                            <span>sitepow.store/{store.slug}</span>
                            <IconExternalLink size={16} />
                          </div>
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {PLAN_DETAILS[store.plan]?.name || store.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'default' : 'outline'}>
                        {isActive
                          ? t('status.active')
                          : isMaintenance
                            ? t('status.maintenance')
                            : t('status.suspended')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-75">
                      {isPastDue ? (
                        <div className="flex flex-col space-y-1.5">
                          <div className="text-destructive flex items-center gap-1 text-sm">
                            <IconAlertTriangle size={16} />
                            <span>
                              {t('subscription.pastDue', {
                                days: daysRemaining,
                              })}
                            </span>
                          </div>
                          <Progress value={progressValue} className="h-1" />
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {isCanceled
                              ? t('subscription.canceled')
                              : t('subscription.normal')}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {t('subscription.daysRemaining', {
                              days: daysRemaining,
                            })}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {PLAN_DETAILS[store.plan].features.join(', ')}
                    </TableCell>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>
                      <StoreRowActions
                        storeId={store.id}
                        onDelete={() => deleteStoreMutation.mutate(store.id)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>
      {meta && (
        <StorePagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={(targetPage) => setPage(targetPage)}
        />
      )}
    </div>
  )
}
