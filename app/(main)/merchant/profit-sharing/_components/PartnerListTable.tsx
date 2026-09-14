'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useDeleteProfitPartner,
  useProfitPartners,
  useToggleProfitPartnerStatus,
} from '@/actions/hooks/profit-sharing'
import { StatsCard } from '@/components/StatsCard'
import {
  PartnerRole,
  ProfitPartnerItem,
  ShareType,
} from '@/types/profit-sharing'
import {
  IconBuildingBank,
  IconCheck,
  IconCoins,
  IconCopy,
  IconEdit,
  IconPercentage,
  IconPlus,
  IconReceiptTax,
  IconTrash,
  IconUsers,
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
import { Progress } from '@/components/ui/progress'
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

import { PartnerDialog } from './PartnerDialog'

interface PartnerListTableProps {
  storeId: string
}

export function PartnerListTable({ storeId }: PartnerListTableProps) {
  const t = useTranslations('merchant.profitSharing')

  const { data: partners = [], isLoading } = useProfitPartners(storeId)
  const { mutate: deletePartner } = useDeleteProfitPartner()
  const { mutate: togglePartnerStatus } = useToggleProfitPartnerStatus()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] =
    useState<ProfitPartnerItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setSelectedPartner(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (partner: ProfitPartnerItem) => {
    setSelectedPartner(partner)
    setDialogOpen(true)
  }

  const handleDelete = (partner: ProfitPartnerItem) => {
    if (window.confirm(`ต้องการลบ "${partner.name}" ใช่หรือไม่?`)) {
      deletePartner(
        { id: partner.id, storeId },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success('ลบข้อมูลเรียบร้อยแล้ว')
            } else {
              toast.error(res.message || 'ไม่สามารถลบข้อมูลได้')
            }
          },
        },
      )
    }
  }

  const handleToggleStatus = (partner: ProfitPartnerItem) => {
    togglePartnerStatus({ id: partner.id, storeId })
  }

  const handleCopyAccount = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('คัดลอกเลขที่บัญชีแล้ว')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Calculate allocated percentages
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

  const getRoleBadgeVariant = (role: PartnerRole) => {
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

  return (
    <div className="space-y-6">
      {/* Allocation Summary Card */}
      <Card className="border-primary/20 bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <IconReceiptTax className="text-primary size-5" />
                สรุปสัดส่วนการจัดสรรกำไร (Profit Allocation Overview)
              </CardTitle>
              <CardDescription>
                สัดส่วนที่หุ้นส่วนและระบบได้รับ
                เทียบกับกำไรสุทธิคงเหลือเก็บเข้ากองทุนสำรองร้านค้า
              </CardDescription>
            </div>
            <Button onClick={handleOpenAdd} className="self-start sm:self-auto">
              <IconPlus className="mr-1.5 size-4" />
              {t('partners.addPartner')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">
                สัดส่วนกำไรสุทธิที่จัดสรรแล้ว ({netProfitPercentTotal}%)
              </span>
              <span className="text-muted-foreground">
                เงินสำรองร้านค้าคงเหลือ: {remainingNetProfitPercent}%
              </span>
            </div>
            <Progress
              value={Math.min(100, netProfitPercentTotal)}
              className="bg-muted h-2.5"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
            <StatsCard
              title="% จากกำไรสุทธิ (รวม)"
              value={`${netProfitPercentTotal}%`}
              description="สัดส่วนที่จัดสรรจากกำไรสุทธิ"
              icon={IconPercentage}
            />
            <StatsCard
              title="% จากยอดขายรวม (รวม)"
              value={`${revenuePercentTotal}%`}
              description="สัดส่วนที่จัดสรรจากยอดขายทั้งหมด"
              icon={IconReceiptTax}
            />
            <StatsCard
              title="ยอดคงที่รายเดือน (รวม)"
              value={`฿${fixedMonthlyTotal.toLocaleString()}`}
              description="ค่าเดฟและระบบรายเดือน"
              icon={IconCoins}
            />
          </div>
        </CardContent>
      </Card>

      {/* Partner Table */}
      <Card>
        <CardContent className="p-0">
          {/* Mobile Card List View */}
          <div className="divide-y md:hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))
            ) : partners.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 p-8 text-center">
                <IconUsers className="size-8 opacity-40" />
                <p className="text-sm">{t('partners.empty')}</p>
                <Button variant="outline" size="sm" onClick={handleOpenAdd}>
                  <IconPlus className="mr-1 size-4" />
                  {t('partners.addPartner')}
                </Button>
              </div>
            ) : (
              partners.map((partner) => (
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
                            ฿{Number(partner.shareValue).toLocaleString()}
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
                    <p className="text-muted-foreground text-xs">
                      {partner.note}
                    </p>
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
                              handleCopyAccount(
                                partner.bankAccount!,
                                partner.id,
                              )
                            }
                            className="text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                          >
                            {copiedId === partner.id ? (
                              <IconCheck className="size-3 text-emerald-500" />
                            ) : (
                              <IconCopy className="size-3" />
                            )}
                            <span className="text-[10px]">คัดลอก</span>
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
                        onCheckedChange={() => handleToggleStatus(partner)}
                      />
                      <span className="text-muted-foreground text-xs">
                        {partner.isActive
                          ? t('partners.active')
                          : t('partners.inactive')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleOpenEdit(partner)}
                      >
                        <IconEdit className="mr-1 size-3.5" />
                        แก้ไข
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-8 text-xs"
                        onClick={() => handleDelete(partner)}
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
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
                  <TableHead>ข้อมูลบัญชีโอนเงิน</TableHead>
                  <TableHead className="text-center">
                    {t('partners.status')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('partners.actions')}
                  </TableHead>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenAdd}
                        >
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
                      className={
                        !partner.isActive ? 'bg-muted/20 opacity-60' : ''
                      }
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
                            ฿{Number(partner.shareValue).toLocaleString()}
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
                                    handleCopyAccount(
                                      partner.bankAccount!,
                                      partner.id,
                                    )
                                  }
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="คัดลอกเลขบัญชี"
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
                            - ไม่ได้ระบุ -
                          </span>
                        )}
                      </TableCell>

                      {/* Status switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Switch
                            checked={partner.isActive}
                            onCheckedChange={() => handleToggleStatus(partner)}
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleOpenEdit(partner)}
                          >
                            <IconEdit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 size-8"
                            onClick={() => handleDelete(partner)}
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
        </CardContent>
      </Card>

      {/* Dialog for Add / Edit */}
      <PartnerDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        storeId={storeId}
        partner={selectedPartner}
      />
    </div>
  )
}
