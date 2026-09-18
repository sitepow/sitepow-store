'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  IconBuildingBank,
  IconCheck,
  IconCopy,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import {
  PartnerRole,
  ProfitPartnerItem,
  ShareType,
} from '@/types/profit-sharing'

interface PartnerMobileListProps {
  partners: ProfitPartnerItem[]
  isLoading: boolean
  copiedId: string | null
  onOpenAdd: () => void
  onOpenEdit: (partner: ProfitPartnerItem) => void
  onDelete: (partner: ProfitPartnerItem) => void
  onToggleStatus: (partner: ProfitPartnerItem) => void
  onCopyAccount: (text: string, id: string) => void
}

function getRoleBadgeVariant(role: PartnerRole) {
  switch (role) {
    case PartnerRole.SHAREHOLDER:
      return 'default'
    case PartnerRole.DEVELOPER:
      return 'secondary'
    case PartnerRole.SYSTEM:
      return 'outline'
    case PartnerRole.MARKETING:
      return 'secondary'
    default:
      return 'outline'
  }
}

export function PartnerMobileList({
  partners,
  isLoading,
  copiedId,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onToggleStatus,
  onCopyAccount,
}: PartnerMobileListProps) {
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()

  if (isLoading) {
    return (
      <div className="divide-y md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <div className="divide-y md:hidden">
        <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 p-8 text-center">
          <IconUsers className="size-8 opacity-40" />
          <p className="text-sm">{t('partners.empty')}</p>
          <Button variant="outline" size="sm" onClick={onOpenAdd}>
            <IconPlus className="mr-1 size-4" />
            {t('partners.addPartner')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y md:hidden">
      {partners.map((partner) => (
        <div
          key={partner.id}
          className={`space-y-3 p-4 transition-colors ${
            !partner.isActive ? 'bg-muted/20 opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-foreground font-semibold">
                {partner.name}
              </div>
              <Badge
                variant={getRoleBadgeVariant(partner.role)}
                className="mt-1 text-xs"
              >
                {t(`roles.${partner.role}` as any)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-base font-bold">
                {partner.shareType === ShareType.FIXED_MONTHLY ? (
                  <span className="text-blue-600 dark:text-blue-400">
                    {format(Number(partner.shareValue))}
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {Number(partner.shareValue)}%
                  </span>
                )}
              </div>
              <div className="text-muted-foreground text-[11px]">
                {t(`shareTypes.${partner.shareType}` as any)}
              </div>
            </div>
          </div>

          {partner.note && (
            <p className="text-muted-foreground text-xs">{partner.note}</p>
          )}

          {/* Bank info */}
          {(partner.bankAccount || partner.promptPay) && (
            <div className="bg-muted/40 space-y-1 rounded-lg p-2.5 text-xs">
              {partner.bankName && (
                <div className="text-foreground flex items-center gap-1 font-medium">
                  <IconBuildingBank className="text-muted-foreground size-3.5" />
                  {partner.bankName}
                </div>
              )}
              {partner.bankAccount && (
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>
                    {partner.bankAccount}{' '}
                    {partner.bankAccountName
                      ? `(${partner.bankAccountName})`
                      : ''}
                  </span>
                  <button
                    onClick={() =>
                      onCopyAccount(partner.bankAccount!, partner.id)
                    }
                    className="text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  >
                    {copiedId === partner.id ? (
                      <IconCheck className="size-3 text-emerald-500" />
                    ) : (
                      <IconCopy className="size-3" />
                    )}
                    <span className="text-[10px]">{t('partners.copy')}</span>
                  </button>
                </div>
              )}
              {partner.promptPay && (
                <div className="text-primary text-[11px]">
                  PromptPay: {partner.promptPay}
                </div>
              )}
            </div>
          )}

          {/* Actions & Status */}
          <div className="border-border/40 flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={partner.isActive}
                onCheckedChange={() => onToggleStatus(partner)}
              />
              <span className="text-muted-foreground text-xs">
                {partner.isActive
                  ? t('partners.active')
                  : t('partners.inactive')}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => onOpenEdit(partner)}
              >
                <IconEdit className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => onDelete(partner)}
              >
                <IconTrash className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

