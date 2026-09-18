'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  IconCoins,
  IconPercentage,
  IconPlus,
  IconReceiptTax,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { ProfitPartnerItem, ShareType } from '@/types/profit-sharing'

interface PartnerAllocationCardProps {
  partners: ProfitPartnerItem[]
  onOpenAdd: () => void
}

export function PartnerAllocationCard({
  partners,
  onOpenAdd,
}: PartnerAllocationCardProps) {
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()

  const activePartners = partners.filter((p) => p.isActive)
  const netProfitPercentTotal = activePartners
    .filter((p) => p.shareType === ShareType.NET_PROFIT_PERCENT)
    .reduce((sum, p) => sum + Number(p.shareValue), 0)
  const revenuePercentTotal = activePartners
    .filter((p) => p.shareType === ShareType.REVENUE_PERCENT)
    .reduce((sum, p) => sum + Number(p.shareValue), 0)
  const fixedMonthlyTotal = activePartners
    .filter((p) => p.shareType === ShareType.FIXED_MONTHLY)
    .reduce((sum, p) => sum + Number(p.shareValue), 0)

  const remainingNetProfitPercent = Math.max(0, 100 - netProfitPercentTotal)

  return (
    <Card className="border-primary/20 bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <IconReceiptTax className="text-primary size-5" />
              {t('partners.overviewTitle')}
            </CardTitle>
            <CardDescription>{t('partners.overviewDesc')}</CardDescription>
          </div>
          <Button onClick={onOpenAdd} className="self-start sm:self-auto">
            <IconPlus className="mr-1.5 size-4" />
            {t('partners.addPartner')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">
              {t('partners.allocatedNetProfit', {
                percent: netProfitPercentTotal,
              })}
            </span>
            <span className="text-muted-foreground">
              {t('partners.remainingReserve', {
                percent: remainingNetProfitPercent,
              })}
            </span>
          </div>
          <Progress
            value={Math.min(100, netProfitPercentTotal)}
            className="bg-muted h-2.5"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
          <StatsCard
            title={t('partners.statsNetProfit')}
            value={`${netProfitPercentTotal}%`}
            description={t('partners.statsNetProfitDesc')}
            icon={IconPercentage}
          />
          <StatsCard
            title={t('partners.statsRevenue')}
            value={`${revenuePercentTotal}%`}
            description={t('partners.statsRevenueDesc')}
            icon={IconReceiptTax}
          />
          <StatsCard
            title={t('partners.statsFixed')}
            value={format(fixedMonthlyTotal)}
            description={t('partners.statsFixedDesc')}
            icon={IconCoins}
          />
        </div>
      </CardContent>
    </Card>
  )
}

