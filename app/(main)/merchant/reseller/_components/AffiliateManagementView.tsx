'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useLocale, useTranslations } from 'next-intl'

import {
  useMerchantAffiliatePayouts,
  useMerchantAffiliateReferrals,
  useMerchantAffiliateStats,
  useMerchantAffiliates,
  useStoreAffiliateSetting,
  useUpdateAffiliateReferralStatus,
  useUpdateStoreAffiliateSetting,
} from '@/actions/hooks/affiliate'
import { StatsCard } from '@/components/StatsCard'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconCheck,
  IconCoin,
  IconExternalLink,
  IconGift,
  IconReceipt2,
  IconSettings,
  IconUsers,
  IconWallet,
  IconX,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AffiliateSettingsDialog } from './AffiliateSettingsDialog'
import { ApproveAffiliatePayoutDialog } from './ApproveAffiliatePayoutDialog'

interface AffiliateManagementViewProps {
  storeId: string
}

export function AffiliateManagementView({
  storeId,
}: AffiliateManagementViewProps) {
  const t = useTranslations('merchant.reseller.affiliate')
  const locale = useLocale()
  const { data: setting, isLoading: isSettingLoading } =
    useStoreAffiliateSetting(storeId)
  const { data: stats, isLoading: isStatsLoading } =
    useMerchantAffiliateStats(storeId)

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('affiliates')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null)
  const [approvePayoutOpen, setApprovePayoutOpen] = useState(false)

  const { data: affiliatesData, isLoading: isAffiliatesLoading } =
    useMerchantAffiliates(storeId, { search })
  const { data: referralsData, isLoading: isReferralsLoading } =
    useMerchantAffiliateReferrals(storeId)
  const { data: payoutsData, isLoading: isPayoutsLoading } =
    useMerchantAffiliatePayouts(storeId)

  const updateSettingMutation = useUpdateStoreAffiliateSetting()
  const updateReferralMutation = useUpdateAffiliateReferralStatus()

  const isEnabled = setting?.isEnabled ?? false
  const commissionRate = Number(setting?.defaultCommissionRate ?? 5)

  const handleToggleEnabled = async (checked: boolean) => {
    try {
      await updateSettingMutation.mutateAsync({
        storeId,
        input: {
          isEnabled: checked,
          defaultCommissionRate: Number(setting?.defaultCommissionRate ?? 5),
          minWithdrawalAmount: Number(setting?.minWithdrawalAmount ?? 100),
          cookieDurationDays: setting?.cookieDurationDays ?? 30,
        },
      })
    } catch {
      // QueryProviders handles the toast
    }
  }

  const handleApproveReferral = async (referralId: string) => {
    try {
      await updateReferralMutation.mutateAsync({
        referralId,
        status: 'APPROVED',
      })
    } catch {
      // QueryProviders handles the toast
    }
  }

  const handleRejectReferral = async (referralId: string) => {
    try {
      await updateReferralMutation.mutateAsync({
        referralId,
        status: 'REJECTED',
      })
    } catch {
      // QueryProviders handles the toast
    }
  }

  const handleOpenApprovePayout = (payout: any) => {
    setSelectedPayout(payout)
    setApprovePayoutOpen(true)
  }

  const affiliates = affiliatesData?.data ?? []
  const referrals = referralsData?.data ?? []
  const payouts = payoutsData?.data ?? []

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BAR: STATUS & SETTINGS */}
      <div className="border-border/80 bg-card flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
            <IconCoin className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-base font-bold">
                {t('status')}
              </h3>
              <Badge
                variant={isEnabled ? 'default' : 'secondary'}
                className="text-xs"
              >
                {isEnabled ? t('active') : t('inactive')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {isEnabled
                ? t('statusDescActive', { rate: commissionRate })
                : t('statusDescInactive')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted/40 flex items-center gap-2 rounded-xl px-3 py-1.5">
            <span className="text-xs font-medium">{t('active')}</span>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleEnabled}
              disabled={isSettingLoading || updateSettingMutation.isPending}
            />
          </div>

          <Button
            variant="outline"
            className="gap-1.5 font-bold"
            onClick={() => setSettingsOpen(true)}
          >
            <IconSettings className="size-4" />
            {t('settings')}
          </Button>
        </div>
      </div>

      {/* 2. OVERVIEW STATSCARD GRID */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {isStatsLoading ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <StatsCard
              title={t('stats.totalSales')}
              value={formatCurrency(stats?.totalSales ?? 0)}
              description={t('stats.totalSalesDesc')}
              icon={IconGift}
            />
            <StatsCard
              title={t('stats.totalCommissionPaid')}
              value={formatCurrency(stats?.totalCommissionPaid ?? 0)}
              description={t('stats.totalCommissionPaidDesc')}
              icon={IconWallet}
            />
            <StatsCard
              title={t('stats.pendingPayout')}
              value={formatCurrency(stats?.pendingPayoutAmount ?? 0)}
              description={t('stats.pendingPayoutDesc', {
                count: stats?.pendingPayoutCount ?? 0,
              })}
              icon={IconReceipt2}
            />
            <StatsCard
              title={t('stats.totalAffiliates')}
              value={`${formatNumber(stats?.totalAffiliates ?? 0)}`}
              description={t('stats.totalAffiliatesDesc')}
              icon={IconUsers}
            />
          </>
        )}
      </div>

      {/* 3. TABS: AFFILIATES, PAYOUTS, REFERRALS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/60 grid w-full max-w-lg grid-cols-3">
          <TabsTrigger
            value="affiliates"
            className="text-xs font-semibold sm:text-sm"
          >
            {t('subtabs.affiliates', { count: affiliates.length })}
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="text-xs font-semibold sm:text-sm"
          >
            {t('subtabs.payouts', { count: payouts.length })}
          </TabsTrigger>
          <TabsTrigger
            value="referrals"
            className="text-xs font-semibold sm:text-sm"
          >
            {t('subtabs.referrals', { count: referrals.length })}
          </TabsTrigger>
        </TabsList>

        {/* SUBTAB 1: AFFILIATES LIST */}
        <TabsContent value="affiliates" className="space-y-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Input
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm text-xs sm:text-sm"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {isAffiliatesLoading ? (
                <div className="space-y-3 p-8">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : affiliates.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  {t('emptyAffiliates')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('columns.affiliate')}</TableHead>
                        <TableHead>{t('columns.referralCode')}</TableHead>
                        <TableHead className="text-right">
                          {t('columns.referredOrders')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.balance')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.totalEarned')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.totalWithdrawn')}
                        </TableHead>
                        <TableHead>{t('columns.payoutAccount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliates.map((a: any) => {
                        const name =
                          `${a.customer?.firstName ?? ''} ${a.customer?.lastName ?? ''}`.trim() ||
                          a.customer?.email ||
                          t('fallbacks.customer')
                        return (
                          <TableRow key={a.id}>
                            <TableCell>
                              <div>
                                <p className="text-foreground text-sm font-bold">
                                  {name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {a.customer?.email ||
                                    a.customer?.phone ||
                                    '-'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs font-bold"
                              >
                                {a.referralCode}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatNumber(a._count?.referrals ?? 0)}
                            </TableCell>
                            <TableCell className="text-primary text-right font-black">
                              {formatCurrency(Number(a.balance))}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(Number(a.totalEarned))}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-right text-xs">
                              {formatCurrency(Number(a.totalWithdrawn))}
                            </TableCell>
                            <TableCell className="text-xs">
                              {a.promptPayNumber ? (
                                <span className="">
                                  {t('fallbacks.promptPay')}:{' '}
                                  {a.promptPayNumber}
                                </span>
                              ) : a.bankName ? (
                                <span>
                                  {a.bankName} {a.bankAccountNo}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBTAB 2: PAYOUT REQUESTS */}
        <TabsContent value="payouts" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t('subtabs.payouts', { count: payouts.length })}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('payoutTable.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isPayoutsLoading ? (
                <div className="space-y-3 p-8">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : payouts.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  {t('emptyPayouts')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('columns.date')}</TableHead>
                        <TableHead>{t('columns.affiliate')}</TableHead>
                        <TableHead className="text-right">
                          {t('columns.amount')}
                        </TableHead>
                        <TableHead>{t('columns.payoutChannel')}</TableHead>
                        <TableHead className="text-center">
                          {t('columns.status')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.action')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((p: any) => {
                        const cust = p.affiliateAccount?.customer
                        const name =
                          `${cust?.firstName ?? ''} ${cust?.lastName ?? ''}`.trim() ||
                          cust?.email ||
                          t('fallbacks.affiliate')

                        return (
                          <TableRow key={p.id}>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(p.createdAt).toLocaleDateString(
                                locale === 'th' ? 'th-TH' : 'en-US',
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-foreground text-sm font-bold">
                                  {name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {p.affiliateAccount?.referralCode}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground text-right text-base font-black">
                              {formatCurrency(Number(p.amount))}
                            </TableCell>
                            <TableCell className="text-xs">
                              {p.promptPayNumber ? (
                                <span className="text-primary font-bold">
                                  {t('fallbacks.promptPay')}:{' '}
                                  {p.promptPayNumber}
                                </span>
                              ) : (
                                <span>
                                  {p.bankName} {p.bankAccountNo} (
                                  {p.bankAccountName})
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  p.status === 'PAID'
                                    ? 'default'
                                    : p.status === 'REJECTED'
                                      ? 'destructive'
                                      : 'outline'
                                }
                                className="text-[11px]"
                              >
                                {p.status === 'PAID'
                                  ? t('statusLabels.paid')
                                  : p.status === 'REJECTED'
                                    ? t('statusLabels.rejected')
                                    : t('statusLabels.pendingPayout')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {p.status === 'PENDING' ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenApprovePayout(p)}
                                  className="font-bold shadow-2xs"
                                >
                                  {t('statusLabels.manageTransfer')}
                                </Button>
                              ) : p.paymentProof ? (
                                <a
                                  href={p.paymentProof}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                                >
                                  <IconExternalLink className="size-3.5" />
                                  {t('statusLabels.viewSlip')}
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  -
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBTAB 3: REFERRAL ORDERS */}
        <TabsContent value="referrals" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t('subtabs.referrals', { count: referrals.length })}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('referralTable.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isReferralsLoading ? (
                <div className="space-y-3 p-8">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  {t('emptyReferrals')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('columns.date')}</TableHead>
                        <TableHead>{t('columns.orderNumber')}</TableHead>
                        <TableHead>{t('columns.affiliate')}</TableHead>
                        <TableHead className="text-right">
                          {t('columns.orderTotal')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.commissionRate')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.commission')}
                        </TableHead>
                        <TableHead className="text-center">
                          {t('columns.status')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('columns.action')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((r: any) => {
                        const cust = r.affiliateAccount?.customer
                        const name =
                          `${cust?.firstName ?? ''} ${cust?.lastName ?? ''}`.trim() ||
                          t('fallbacks.affiliate')

                        return (
                          <TableRow key={r.id}>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(r.createdAt).toLocaleDateString(
                                locale === 'th' ? 'th-TH' : 'en-US',
                              )}
                            </TableCell>
                            <TableCell className="text-xs font-semibold">
                              {r.order?.orderNumber}
                            </TableCell>
                            <TableCell>
                              <div>
                                <span className="text-foreground text-xs font-semibold">
                                  {name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-[10px]"
                                >
                                  {r.affiliateAccount?.referralCode}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(Number(r.orderAmount))}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-right text-xs">
                              {Number(r.commissionRate)}%
                            </TableCell>
                            <TableCell className="text-primary text-right font-black">
                              +{formatCurrency(Number(r.commissionAmount))}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  r.status === 'APPROVED' || r.status === 'PAID'
                                    ? 'default'
                                    : r.status === 'REJECTED'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className="text-[11px]"
                              >
                                {r.status === 'APPROVED'
                                  ? t('statusLabels.approved')
                                  : r.status === 'PAID'
                                    ? t('statusLabels.paid')
                                    : r.status === 'REJECTED'
                                      ? t('statusLabels.rejected')
                                      : t('statusLabels.pending')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {r.status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 text-emerald-600 hover:text-emerald-700"
                                    onClick={() => handleApproveReferral(r.id)}
                                  >
                                    <IconCheck className="mr-1 size-3.5" />
                                    {t('statusLabels.approveBtn')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive h-8 px-2"
                                    onClick={() => handleRejectReferral(r.id)}
                                  >
                                    <IconX className="size-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  -
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <AffiliateSettingsDialog
        storeId={storeId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ApproveAffiliatePayoutDialog
        payout={selectedPayout}
        open={approvePayoutOpen}
        onOpenChange={setApprovePayoutOpen}
      />
    </div>
  )
}
