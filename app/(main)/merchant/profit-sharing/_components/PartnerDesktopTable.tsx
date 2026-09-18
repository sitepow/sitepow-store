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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import {
  PartnerRole,
  ProfitPartnerItem,
  ShareType,
} from '@/types/profit-sharing'

interface PartnerDesktopTableProps {
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

export function PartnerDesktopTable({
  partners,
  isLoading,
  copiedId,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  onToggleStatus,
  onCopyAccount,
}: PartnerDesktopTableProps) {
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()

  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('partners.partnerName')}</TableHead>
            <TableHead>{t('partners.partnerRole')}</TableHead>
            <TableHead>{t('partners.shareType')}</TableHead>
            <TableHead className="text-right">
              {t('partners.shareValue')}
            </TableHead>
            <TableHead>{t('partners.bankAccountInfo')}</TableHead>
            <TableHead className="text-center">{t('partners.status')}</TableHead>
            <TableHead className="text-right">{t('partners.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-36" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-5 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-16" />
                </TableCell>
              </TableRow>
            ))
          ) : partners.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground h-32 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <IconUsers className="size-8 opacity-40" />
                  <p>{t('partners.empty')}</p>
                  <Button variant="outline" size="sm" onClick={onOpenAdd}>
                    <IconPlus className="mr-1 size-4" />
                    {t('partners.addPartner')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            partners.map((partner) => (
              <TableRow
                key={partner.id}
                className={!partner.isActive ? 'bg-muted/20 opacity-60' : ''}
              >
                {/* Name & Note */}
                <TableCell>
                  <div className="text-foreground font-medium">
                    {partner.name}
                  </div>
                  {partner.note && (
                    <div className="text-muted-foreground max-w-xs truncate text-xs">
                      {partner.note}
                    </div>
                  )}
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(partner.role)}>
                    {t(`roles.${partner.role}` as any)}
                  </Badge>
                </TableCell>

                {/* Share Type */}
                <TableCell className="text-sm">
                  {t(`shareTypes.${partner.shareType}` as any)}
                </TableCell>

                {/* Share Value */}
                <TableCell className="text-right text-sm font-bold">
                  {partner.shareType === ShareType.FIXED_MONTHLY ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      {format(Number(partner.shareValue))}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {Number(partner.shareValue)}%
                    </span>
                  )}
                </TableCell>

                {/* Bank / PromptPay */}
                <TableCell>
                  {partner.bankAccount || partner.promptPay ? (
                    <div className="space-y-0.5 text-xs">
                      {partner.bankName && (
                        <div className="text-foreground flex items-center gap-1 font-medium">
                          <IconBuildingBank className="text-muted-foreground size-3" />
                          {partner.bankName}
                        </div>
                      )}
                      {partner.bankAccount && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <span>{partner.bankAccount}</span>
                          <button
                            onClick={() =>
                              onCopyAccount(partner.bankAccount!, partner.id)
                            }
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title={t('partners.copyAccount')}
                          >
                            {copiedId === partner.id ? (
                              <IconCheck className="size-3 text-emerald-500" />
                            ) : (
                              <IconCopy className="size-3" />
                            )}
                          </button>
                        </div>
                      )}
                      {partner.bankAccountName && (
                        <div className="text-muted-foreground text-[11px]">
                          ({partner.bankAccountName})
                        </div>
                      )}
                      {partner.promptPay && (
                        <div className="text-primary text-[11px]">
                          PromptPay: {partner.promptPay}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">
                      {t('partners.unspecified')}
                    </span>
                  )}
                </TableCell>

                {/* Status switch */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
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
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2.5">
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => onOpenEdit(partner)}
                    >
                      <IconEdit className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-lg"
                      onClick={() => onDelete(partner)}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

