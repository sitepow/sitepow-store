'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  useCustomerAffiliateDashboard,
  useRequestAffiliatePayout,
  useStorefrontAffiliateProducts,
  useUpdateCustomerAffiliateBank,
} from '@/actions/hooks/storefront/affiliate'
import { StatsCard } from '@/components/StatsCard'
import { BUYER_NAVIGATION } from '@/constants/navigation'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconBuildingBank,
  IconCheck,
  IconCoin,
  IconCopy,
  IconExternalLink,
  IconGift,
  IconLink,
  IconReceipt2,
  IconShare,
  IconSparkles,
  IconWallet,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function StoreUserAffiliatePage() {
  const t = useTranslations('customer.affiliate')
  const locale = useLocale()
  const params = useParams()
  const storeSlug = (params?.domain as string) || ''
  const { store } = useStoreData()
  const { currentCurrency, convert } = useStorefrontCurrency(
    (store as any)?.baseCurrency,
  )

  const { data, isLoading } = useCustomerAffiliateDashboard(storeSlug)
  const { data: products = [] } = useStorefrontAffiliateProducts(storeSlug)

  const requestPayoutMutation = useRequestAffiliatePayout()
  const updateBankMutation = useUpdateCustomerAffiliateBank()

  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedProductLink, setCopiedProductLink] = useState(false)

  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNo, setBankAccountNo] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [promptPayNumber, setPromptPayNumber] = useState('')

  const account = data?.account
  const setting = data?.setting
  const stats = data?.stats
  const referrals = data?.referrals ?? []
  const payouts = data?.payouts ?? []

  const isEnabled = data?.isEnabled ?? setting?.isEnabled ?? false
  const isAuthenticated = data?.isAuthenticated ?? true
  const commissionRate = Number(setting?.defaultCommissionRate ?? 5)
  const minWithdrawal = Number(setting?.minWithdrawalAmount ?? 100)
  const availableBalance = stats?.availableBalance ?? 0

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const storeReferralLink = account
    ? `${origin}/products?ref=${account.referralCode}`
    : ''

  const productReferralLink =
    account && selectedProductSlug
      ? `${origin}/products/${selectedProductSlug}?ref=${account.referralCode}`
      : ''

  const handleCopy = (text: string, isProduct = false) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (isProduct) {
      setCopiedProductLink(true)
      setTimeout(() => setCopiedProductLink(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
    toast.success(t('toasts.linkCopied'))
  }

  const handleOpenPayoutDialog = () => {
    if (account) {
      setBankName(account.bankName || '')
      setBankAccountNo(account.bankAccountNo || '')
      setBankAccountName(account.bankAccountName || '')
      setPromptPayNumber(account.promptPayNumber || '')
    }
    setPayoutAmount('')
    setPayoutDialogOpen(true)
  }

  const handleSubmitPayout = async () => {
    const amountNum = parseFloat(payoutAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(t('toasts.invalidAmount'))
      return
    }
    if (amountNum < minWithdrawal) {
      toast.error(t('toasts.minWithdrawal', { min: minWithdrawal }))
      return
    }
    if (amountNum > availableBalance) {
      toast.error(t('toasts.insufficientBalance'))
      return
    }
    if (!promptPayNumber && (!bankName || !bankAccountNo)) {
      toast.error(t('toasts.requireBankOrPromptPay'))
      return
    }

    try {
      const res = await requestPayoutMutation.mutateAsync({
        storeSlug,
        input: {
          amount: amountNum,
          bankName,
          bankAccountNo,
          bankAccountName,
          promptPayNumber,
        },
      })
      if (res.success) {
        setPayoutDialogOpen(false)
        setPayoutAmount('')
      }
    } catch {
      // QueryProviders handles error toast
    }
  }

  const handleSaveBankInfo = async () => {
    try {
      await updateBankMutation.mutateAsync({
        storeSlug,
        input: {
          bankName,
          bankAccountNo,
          bankAccountName,
          promptPayNumber,
        },
      })
    } catch {
      // QueryProviders handles error toast
    }
  }

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconCoin}
        title={t('title')}
        description={t('description')}
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      ) : !isEnabled ? (
        <ActionRequiredAlert
          title={t('disabledTitle')}
          description={t('disabledDesc')}
        />
      ) : !isAuthenticated ? (
        <ActionRequiredAlert
          title={t('unauthenticatedTitle')}
          description={t('unauthenticatedDesc')}
          action={
            <Button asChild className="font-bold shadow-xs">
              <Link href={`/auth/login?redirect=/user/affiliate`}>
                {t('loginBtn')}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* 1. HERO SHARE CARD */}
          <Card className="border-primary/20 from-primary/5 via-card to-card relative overflow-hidden bg-linear-to-br shadow-sm">
            <div className="bg-primary/10 absolute -top-12 -right-12 size-48 rounded-full blur-2xl" />
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <IconSparkles className="size-4.5" />
                  </span>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {t('commissionBanner', { rate: commissionRate })}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t('commissionBannerDesc')}
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary px-3 py-1 text-xs font-bold"
                >
                  {t('referralCode', { code: account?.referralCode ?? '' })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Store Referral Link */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold">
                  {t('storeLink')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={storeReferralLink}
                    className="bg-background text-xs font-medium"
                  />
                  <Button
                    type="button"
                    onClick={() => handleCopy(storeReferralLink)}
                    className="shrink-0 gap-1.5 font-bold"
                  >
                    {copiedLink ? (
                      <>
                        <IconCheck className="size-4 text-emerald-300" />
                        {t('copied')}
                      </>
                    ) : (
                      <>
                        <IconCopy className="size-4" />
                        {t('copyLink')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Product Specific Link Generator */}
              {products.length > 0 && (
                <div className="border-border/60 bg-muted/20 space-y-2 rounded-xl border p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <IconLink className="text-primary size-4" />
                    <span className="text-foreground text-xs font-bold">
                      {t('generateProductLink')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      value={selectedProductSlug}
                      onValueChange={setSelectedProductSlug}
                    >
                      <SelectTrigger className="bg-background text-xs sm:text-sm">
                        <SelectValue placeholder={t('selectProduct')} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.slug}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!selectedProductSlug}
                      onClick={() => handleCopy(productReferralLink, true)}
                      className="shrink-0 gap-1.5 font-bold"
                    >
                      {copiedProductLink ? (
                        <>
                          <IconCheck className="size-4 text-emerald-600" />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <IconShare className="size-4" />
                          {t('copyProductLink')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. STATS KPI CARDS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {/* Available Balance */}
            <StatsCard
              title={t('stats.availableBalance')}
              value={formatCurrency(convert(availableBalance), currentCurrency)}
              icon={IconWallet}
              className="border-primary/30"
              valueClassName="text-primary font-black"
              action={
                <Button
                  size="sm"
                  className="w-full font-bold shadow-xs"
                  disabled={availableBalance < minWithdrawal}
                  onClick={handleOpenPayoutDialog}
                >
                  {t('stats.requestPayout')}
                </Button>
              }
            />

            {/* Pending Commission */}
            <StatsCard
              title={t('stats.pendingCommission')}
              value={formatCurrency(
                convert(stats?.pendingCommission ?? 0),
                currentCurrency,
              )}
              description={t('stats.pendingDesc')}
              icon={IconReceipt2}
            />

            {/* Total Earned */}
            <StatsCard
              title={t('stats.totalEarned')}
              value={formatCurrency(
                convert(stats?.totalEarned ?? 0),
                currentCurrency,
              )}
              description={t('stats.withdrawn', {
                amount: formatCurrency(
                  convert(stats?.totalWithdrawn ?? 0),
                  currentCurrency,
                ),
              })}
              icon={IconCoin}
            />

            {/* Total Referred Orders */}
            <StatsCard
              title={t('stats.totalReferredOrders')}
              value={`${formatNumber(stats?.totalReferralsCount ?? 0)} ${t('stats.ordersUnit')}`}
              description={t('stats.referredOrdersDesc')}
              icon={IconGift}
            />
          </div>

          {/* 3. TABS: REFERRALS, PAYOUTS, BANK SETTING */}
          <Tabs defaultValue="referrals" className="w-full">
            <TabsList className="bg-muted/60 grid w-full max-w-md grid-cols-3">
              <TabsTrigger
                value="referrals"
                className="text-xs font-semibold sm:text-sm"
              >
                {t('tabs.referrals', { count: referrals.length })}
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                className="text-xs font-semibold sm:text-sm"
              >
                {t('tabs.payouts', { count: payouts.length })}
              </TabsTrigger>
              <TabsTrigger
                value="bank"
                className="text-xs font-semibold sm:text-sm"
              >
                {t('tabs.bank')}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: REFERRAL ORDERS */}
            <TabsContent value="referrals" className="pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t('referralTable.title')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('referralTable.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                  {referrals.length === 0 ? (
                    <div className="text-muted-foreground py-12 text-center text-sm">
                      {t('referralTable.empty')}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('referralTable.date')}</TableHead>
                            <TableHead>
                              {t('referralTable.orderNumber')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('referralTable.orderTotal')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('referralTable.rate')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('referralTable.commission')}
                            </TableHead>
                            <TableHead className="text-center">
                              {t('referralTable.status')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referrals.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="text-muted-foreground text-xs">
                                {new Date(r.createdAt).toLocaleDateString(
                                  locale === 'th' ? 'th-TH' : 'en-US',
                                )}
                              </TableCell>
                              <TableCell className="text-xs font-semibold">
                                {r.order?.orderNumber || r.orderId}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(
                                  convert(Number(r.orderAmount)),
                                  currentCurrency,
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-right text-xs">
                                {Number(r.commissionRate)}%
                              </TableCell>
                              <TableCell className="text-primary text-right font-bold">
                                +
                                {formatCurrency(
                                  convert(Number(r.commissionAmount)),
                                  currentCurrency,
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    r.status === 'APPROVED' ||
                                    r.status === 'PAID'
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: PAYOUT HISTORY */}
            <TabsContent value="payouts" className="pt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t('payoutTable.title')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('payoutTable.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                  {payouts.length === 0 ? (
                    <div className="text-muted-foreground py-12 text-center text-sm">
                      {t('payoutTable.empty')}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('payoutTable.date')}</TableHead>
                            <TableHead className="text-right">
                              {t('payoutTable.amount')}
                            </TableHead>
                            <TableHead>{t('payoutTable.account')}</TableHead>
                            <TableHead className="text-center">
                              {t('payoutTable.status')}
                            </TableHead>
                            <TableHead>{t('payoutTable.slip')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payouts.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="text-muted-foreground text-xs">
                                {new Date(p.createdAt).toLocaleDateString(
                                  locale === 'th' ? 'th-TH' : 'en-US',
                                )}
                              </TableCell>
                              <TableCell className="text-foreground text-right font-bold">
                                {formatCurrency(
                                  convert(Number(p.amount)),
                                  currentCurrency,
                                )}
                              </TableCell>
                              <TableCell className="text-xs">
                                {p.promptPayNumber ? (
                                  <span>
                                    {t('payoutTable.promptPay')}:{' '}
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
                              <TableCell className="text-xs">
                                {p.paymentProof ? (
                                  <a
                                    href={p.paymentProof}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary inline-flex items-center gap-1 hover:underline"
                                  >
                                    <IconExternalLink className="size-3.5" />
                                    {t('payoutTable.viewSlip')}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: BANK / PAYOUT SETTINGS */}
            <TabsContent value="bank" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('bankForm.title')}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t('bankForm.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-xl space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {t('bankForm.promptPay')}
                      </Label>
                      <Input
                        placeholder={t('bankForm.promptPayPlaceholder')}
                        value={promptPayNumber}
                        onChange={(e) => setPromptPayNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {t('bankForm.bankName')}
                      </Label>
                      <Input
                        placeholder={t('bankForm.bankNamePlaceholder')}
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {t('bankForm.accountNo')}
                      </Label>
                      <Input
                        placeholder={t('bankForm.accountNoPlaceholder')}
                        value={bankAccountNo}
                        onChange={(e) => setBankAccountNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        {t('bankForm.accountName')}
                      </Label>
                      <Input
                        placeholder={t('bankForm.accountNamePlaceholder')}
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSaveBankInfo}
                    disabled={updateBankMutation.isPending}
                    className="font-bold"
                  >
                    {t('bankForm.save')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* REQUEST PAYOUT DIALOG */}
          <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <IconBuildingBank className="text-primary size-5" />
                  {t('payoutDialog.title')}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {t('payoutDialog.description', {
                    balance: formatCurrency(
                      convert(availableBalance),
                      currentCurrency,
                    ),
                    min: minWithdrawal,
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {t('payoutDialog.amountLabel')}
                  </Label>
                  <Input
                    type="number"
                    min={minWithdrawal}
                    max={availableBalance}
                    placeholder={t('payoutDialog.amountPlaceholder', {
                      min: minWithdrawal,
                    })}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {t('payoutDialog.promptPayLabel')}
                  </Label>
                  <Input
                    placeholder={t('bankForm.promptPayPlaceholder')}
                    value={promptPayNumber}
                    onChange={(e) => setPromptPayNumber(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {t('payoutDialog.bankLabel')}
                    </Label>
                    <Input
                      placeholder={t('bankForm.bankNamePlaceholder')}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {t('payoutDialog.accountNoLabel')}
                    </Label>
                    <Input
                      placeholder={t('bankForm.accountNoPlaceholder')}
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {t('payoutDialog.accountNameLabel')}
                  </Label>
                  <Input
                    placeholder={t('bankForm.accountNamePlaceholder')}
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayoutDialogOpen(false)}
                >
                  {t('payoutDialog.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitPayout}
                  disabled={requestPayoutMutation.isPending}
                  className="font-bold"
                >
                  {t('payoutDialog.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Sidebar>
  )
}
