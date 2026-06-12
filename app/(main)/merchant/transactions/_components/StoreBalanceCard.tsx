import { useStoreBalance } from '@/actions/hooks/deposit'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { DepositDialog } from './Depositdialog'

export function StoreBalanceCard() {
  const { selectedStoreId } = useStoreFilter()
  const storeId = selectedStoreId === ALL_STORES ? '' : selectedStoreId
  const { data, isLoading } = useStoreBalance(storeId)

  return (
    <Card className="from-primary/10 via-primary/2 to-background border-primary/20 flex h-fit flex-col justify-between overflow-hidden bg-linear-to-br xl:col-span-1">
      <CardHeader className="pb-2">
        <CardDescription className="text-primary text-xs font-bold">
          ยอดเงินคงเหลือใน Wallet ร้านค้า
        </CardDescription>
        <CardTitle className="pt-1 text-3xl font-extrabold">
          {isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            formatCurrency(Number(data?.balance ?? 0))
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground pb-4 text-[11px] leading-relaxed">
        ใช้ชำระค่าขนส่งอัตโนมัติเมื่อมีออเดอร์ใหม่ และค่าบริการอื่นๆ บนแพลตฟอร์ม
        Sitepow
      </CardContent>
      <CardFooter className="bg-muted/5 border-t pt-3 pb-3">
        <DepositDialog />
      </CardFooter>
    </Card>
  )
}
