'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useStoreAffiliateSetting,
  useUpdateStoreAffiliateSetting,
} from '@/actions/hooks/affiliate'
import { IconSettings } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'

interface AffiliateSettingsDialogProps {
  storeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AffiliateSettingsDialog({
  storeId,
  open,
  onOpenChange,
}: AffiliateSettingsDialogProps) {
  const t = useTranslations('merchant.reseller.affiliate.dialogs')
  const { data: setting, isLoading } = useStoreAffiliateSetting(storeId)
  const updateSettingMutation = useUpdateStoreAffiliateSetting()

  const [isEnabled, setIsEnabled] = useState(false)
  const [commissionRate, setCommissionRate] = useState('5')
  const [minWithdrawal, setMinWithdrawal] = useState('100')
  const [cookieDays, setCookieDays] = useState('30')

  useEffect(() => {
    if (setting) {
      setIsEnabled(setting.isEnabled)
      setCommissionRate(String(setting.defaultCommissionRate))
      setMinWithdrawal(String(setting.minWithdrawalAmount))
      setCookieDays(String(setting.cookieDurationDays ?? 30))
    }
  }, [setting])

  const handleSave = async () => {
    const rateNum = parseFloat(commissionRate)
    const minNum = parseFloat(minWithdrawal)
    const daysNum = parseInt(cookieDays, 10)

    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      toast.error(t('rateError'))
      return
    }

    if (isNaN(minNum) || minNum < 0) {
      toast.error(t('minAmountError'))
      return
    }

    try {
      const res = await updateSettingMutation.mutateAsync({
        storeId,
        input: {
          isEnabled,
          defaultCommissionRate: rateNum,
          minWithdrawalAmount: minNum,
          cookieDurationDays: isNaN(daysNum) ? 30 : daysNum,
        },
      })

      if (res.success) {
        onOpenChange(false)
      }
    } catch {
      // QueryProviders onError handles the error toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconSettings className="text-primary size-5" />
            {t('settingsTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('settingsDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Enable Toggle */}
          <div className="border-border/80 flex items-center justify-between rounded-xl border p-3">
            <div>
              <Label className="text-sm font-bold">{t('enableLabel')}</Label>
              <p className="text-muted-foreground text-xs">{t('enableDesc')}</p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              disabled={isLoading}
            />
          </div>

          {/* Commission Rate */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t('commissionRate')}
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="5"
                className="pr-8"
              />
              <span className="text-muted-foreground absolute top-2.5 right-3 text-xs font-bold">
                %
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              {t('commissionRateDesc')}
            </p>
          </div>

          {/* Min Withdrawal Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t('minWithdrawal')}
            </Label>
            <Input
              type="number"
              min="0"
              value={minWithdrawal}
              onChange={(e) => setMinWithdrawal(e.target.value)}
              placeholder="100"
            />
            <p className="text-muted-foreground text-[11px]">
              {t('minWithdrawalDesc')}
            </p>
          </div>

          {/* Cookie Duration */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('cookieDays')}</Label>
            <Input
              type="number"
              min="1"
              max="365"
              value={cookieDays}
              onChange={(e) => setCookieDays(e.target.value)}
              placeholder="30"
            />
            <p className="text-muted-foreground text-[11px]">
              {t('cookieDaysDesc')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateSettingMutation.isPending}
            className="font-bold"
          >
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
