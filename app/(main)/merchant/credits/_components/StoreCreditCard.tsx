'use client'

import { useTranslations } from 'next-intl'

import { useStoreCredit } from '@/actions/hooks/credit'
import { AVG_INPUT_TOKENS, AVG_OUTPUT_TOKENS } from '@/constants/ai'
import { Plan } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreData } from '@/stores/sites/use-store-data'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { CreditUsageType } from '@/types/ai'
import { estimateCost } from '@/utils/ai'
import { formatNumber } from '@/utils/pricing'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { PurchaseCreditDialog } from './PurchaseCreditDialog'

export function StoreCreditCard() {
  const { currentStore } = useCurrentStore()
  const t = useTranslations('merchant.credits')
  const { selectedStoreId } = useStoreFilter()
  const storeId = selectedStoreId === ALL_STORES ? '' : selectedStoreId
  const { store } = useStoreData()
  const { data, isLoading } = useStoreCredit(storeId)

  const balance = Number(data?.balance ?? 0)

  const aiCost = estimateCost(
    CreditUsageType.AI,
    store?.plan || Plan.FREE,
    AVG_INPUT_TOKENS,
    AVG_OUTPUT_TOKENS,
  )

  const slipCost = estimateCost(CreditUsageType.SLIP, store?.plan || Plan.FREE)

  const estimateAiMessages =
    balance > 0 ? Math.floor(balance / aiCost.credits) : 0
  const estimateSlipChecks =
    balance > 0 ? Math.floor(balance / slipCost.credits) : 0

  return (
    <Card
      className="from-primary/10 via-primary/2 to-background border-primary/20 flex h-fit flex-col justify-between overflow-hidden bg-linear-to-br xl:col-span-1"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-primary text-xs font-bold">
          {t('balance')}
        </CardDescription>
        <CardTitle className="text-foreground flex items-baseline gap-1 pt-1 text-4xl font-extrabold">
          {isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            formatNumber(Number(data?.balance ?? 0))
          )}
          <span className="text-muted-foreground text-xs font-normal">
            {t('creditsUnit')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground max-w-96 pb-4 text-[11px] leading-relaxed">
        {t('cardContent')}
        {!isLoading && balance > 0 && (
          <div className="bg-primary/5 border-primary/10 mt-5 rounded-md border p-2">
            <p className="text-primary font-semibold">
              {t('estimatedUsageTitle')}
            </p>
            <p>
              {t('estimatedAiMessages', {
                count: formatNumber(estimateAiMessages),
              })}
            </p>
            <p>
              {t('estimatedSlipChecks', {
                count: formatNumber(estimateSlipChecks),
              })}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/5 flex flex-wrap gap-2.5 border-t pt-3 pb-3">
        <PurchaseCreditDialog />
      </CardFooter>
    </Card>
  )
}
