'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  useDeleteEmployeeSalaryConfig,
  useEmployeeSalaryConfigs,
  useSyncEmployeesFromStore,
  useToggleEmployeeSalaryConfigStatus,
} from '@/actions/hooks/payroll'
import { SalaryType } from '@/generated/prisma/enums'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import {
  IconBuildingBank,
  IconCheck,
  IconCreditCard,
  IconEdit,
  IconExternalLink,
  IconPlus,
  IconPower,
  IconRefresh,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { StaffSalaryDialog } from './StaffSalaryDialog'

interface StaffSalaryTableProps {
  storeId: string
}

export function StaffSalaryTable({ storeId }: StaffSalaryTableProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const tTypes = useTranslations('merchant.payroll.salaryTypes')
  const { formatCurrency } = useMerchantCurrency()
  const { data: res, isLoading } = useEmployeeSalaryConfigs(storeId)
  const deleteMutation = useDeleteEmployeeSalaryConfig()
  const toggleMutation = useToggleEmployeeSalaryConfigStatus()
  const syncEmployeesMutation = useSyncEmployeesFromStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] =
    useState<EmployeeSalaryConfigItem | null>(null)

  const staffList = res?.data || []

  const handleSyncFromEmployees = async () => {
    try {
      const result = await syncEmployeesMutation.mutateAsync(storeId)
      if (result.success) {
        toast.success(result.message || tStaff('syncSuccess'))
      } else {
        toast.error(result.message || tStaff('syncFailed'))
      }
    } catch {
      toast.error(tStaff('syncFailed'))
    }
  }

  const activeStaff = staffList.filter((s) => s.isActive)
  const totalBase = activeStaff.reduce((sum, s) => sum + s.baseSalary, 0)

  const handleOpenAdd = () => {
    setEditingStaff(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (staff: EmployeeSalaryConfigItem) => {
    setEditingStaff(staff)
    setDialogOpen(true)
  }

  const handleDelete = async (staff: EmployeeSalaryConfigItem) => {
    if (!confirm(tStaff('deleteConfirm'))) {
      return
    }

    try {
      const result = await deleteMutation.mutateAsync({
        id: staff.id,
        storeId,
      })

      if (result.success) {
        toast.success(tStaff('deleteSuccess'))
      } else {
        toast.error(result.message || tStaff('deleteFailed'))
      }
    } catch {
      toast.error(tStaff('deleteFailed'))
    }
  }

  const handleToggle = async (staff: EmployeeSalaryConfigItem) => {
    try {
      const result = await toggleMutation.mutateAsync({
        id: staff.id,
        storeId,
      })

      if (result.success) {
        toast.success(
          result.data?.isActive
            ? `${staff.employeeName} (${tStaff('active')})`
            : `${staff.employeeName} (${tStaff('inactive')})`,
        )
      } else {
        toast.error(result.message || tStaff('saveFailed'))
      }
    } catch {
      toast.error(tStaff('saveFailed'))
    }
  }

  const getSalaryTypeBadge = (type: SalaryType) => {
    switch (type) {
      case SalaryType.MONTHLY:
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-600">
            {tTypes('MONTHLY')}
          </Badge>
        )
      case SalaryType.DAILY:
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-600">
            {tTypes('DAILY')}
          </Badge>
        )
      case SalaryType.HOURLY:
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 text-emerald-600"
          >
            {tTypes('HOURLY')}
          </Badge>
        )
      case SalaryType.COMMISSION:
        return (
          <Badge
            variant="outline"
            className="border-purple-200 text-purple-600"
          >
            {tTypes('COMMISSION')}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards with StatsCard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title={tStaff('totalStaff')}
          value={tStaff('staffUnit', { count: staffList.length })}
          description={tStaff('description')}
          icon={IconUsers}
        />
        <StatsCard
          title={tStaff('totalBasePerMonth')}
          value={formatCurrency(totalBase)}
          description={tStaff('activeStaff')}
          icon={IconWallet}
          valueClassName="text-primary font-bold"
        />
        <StatsCard
          title={tStaff('activeStaff')}
          value={`${activeStaff.length} / ${staffList.length}`}
          description={tStaff('hasSocialSecurityDesc')}
          icon={IconUserCheck}
          badge={
            activeStaff.length === staffList.length
              ? tStaff('active')
              : tStaff('inactive')
          }
        />
      </div>

      {/* 2. Main Table / List Card */}
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUser className="text-primary size-5" />
              {tStaff('title')}
            </CardTitle>
            <CardDescription>{tStaff('description')}</CardDescription>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncFromEmployees}
              disabled={syncEmployeesMutation.isPending}
              className="flex-1 text-xs sm:flex-initial"
              title={tStaff('syncFromEmployees')}
            >
              <IconRefresh className="mr-1 size-3.5" />
              {syncEmployeesMutation.isPending
                ? tStaff('dialog.saving')
                : tStaff('syncFromEmployees')}
            </Button>
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="flex-1 text-xs sm:flex-initial"
            >
              <IconPlus className="mr-1 size-3.5" />
              {tStaff('add')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-8 text-center text-sm">
              {tStaff('dialog.saving')}
            </div>
          ) : staffList.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-10 text-center">
              <IconUsers className="text-muted-foreground/40 size-10" />
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  {tStaff('empty')}
                </p>
                <p className="text-muted-foreground max-w-md text-xs">
                  ร้านค้านี้ยังไม่มีการกำหนดฐานเงินเดือนพนักงาน
                  คุณสามารถซิงค์รายชื่อพนักงานที่มีอยู่ในระบบ
                  หรือเพิ่มข้อมูลพนักงานใหม่ได้
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncFromEmployees}
                  disabled={syncEmployeesMutation.isPending}
                >
                  <IconRefresh className="mr-1.5 size-3.5" />
                  {syncEmployeesMutation.isPending
                    ? tStaff('dialog.saving')
                    : tStaff('syncFromEmployees')}
                </Button>
                <Button size="sm" onClick={handleOpenAdd}>
                  <IconPlus className="mr-1.5 size-3.5" />
                  {tStaff('add')}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/merchant/employee" className="text-xs">
                    <IconUser className="mr-1.5 size-3.5" />
                    ไปที่ระบบจัดการพนักงาน
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (hidden on mobile) */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tStaff('thColEmployee')}</TableHead>
                      <TableHead>{tStaff('position')}</TableHead>
                      <TableHead>{tStaff('thColSalaryType')}</TableHead>
                      <TableHead className="text-right">
                        {tStaff('thColBaseSalary')}
                      </TableHead>
                      <TableHead>{tStaff('thColBank')}</TableHead>
                      <TableHead className="text-center">
                        {tStaff('thColStatus')}
                      </TableHead>
                      <TableHead className="text-right">
                        {tStaff('thColActions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff) => (
                      <TableRow
                        key={staff.id}
                        className={
                          !staff.isActive ? 'bg-muted/20 opacity-60' : ''
                        }
                      >
                        <TableCell>
                          <div className="text-foreground font-medium">
                            {staff.employeeName}
                          </div>
                          {staff.employeeCode && (
                            <div className="text-muted-foreground text-xs">
                              {staff.employeeCode}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {staff.position || '-'}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {staff.department || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSalaryTypeBadge(staff.salaryType)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(staff.baseSalary)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            {staff.bankName && (
                              <div className="text-foreground flex items-center gap-1 font-medium">
                                <IconBuildingBank className="text-muted-foreground size-3.5" />
                                {staff.bankName}
                              </div>
                            )}
                            {staff.bankAccountNumber && (
                              <div className="text-muted-foreground">
                                {tStaff('dialog.bankAccountNumber')}:{' '}
                                {staff.bankAccountNumber}
                              </div>
                            )}
                            {staff.promptpayNumber && (
                              <div className="text-muted-foreground">
                                {tStaff('accountPromptPay')}:{' '}
                                {staff.promptpayNumber}
                              </div>
                            )}
                            {!staff.bankName &&
                              !staff.bankAccountNumber &&
                              !staff.promptpayNumber && (
                                <span className="text-muted-foreground">-</span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {staff.isActive ? (
                            <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">
                              {tStaff('active')}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              {tStaff('inactive')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={
                                staff.isActive
                                  ? tStaff('inactive')
                                  : tStaff('active')
                              }
                              onClick={() => handleToggle(staff)}
                            >
                              <IconPower className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={tStaff('edit')}
                              onClick={() => handleOpenEdit(staff)}
                            >
                              <IconEdit className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={tStaff('actions')}
                              onClick={() => handleDelete(staff)}
                            >
                              <IconTrash className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARD VIEW (visible on mobile only) */}
              <div className="divide-border/60 space-y-3 divide-y p-3 md:hidden">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className={`border-border/60 bg-card space-y-3 rounded-xl border p-4 ${
                      !staff.isActive ? 'bg-muted/20 opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-foreground text-base font-semibold">
                          {staff.employeeName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {staff.employeeCode ? `${staff.employeeCode} • ` : ''}
                          {staff.position || '-'}
                          {staff.department ? ` (${staff.department})` : ''}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {staff.isActive ? (
                          <Badge className="border-emerald-200 bg-emerald-500/10 text-xs text-emerald-600">
                            {tStaff('active')}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground text-xs"
                          >
                            {tStaff('inactive')}
                          </Badge>
                        )}
                        {getSalaryTypeBadge(staff.salaryType)}
                      </div>
                    </div>

                    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-2.5 text-sm">
                      <span className="text-muted-foreground text-xs">
                        {tStaff('baseSalary')}:
                      </span>
                      <span className="text-primary font-semibold">
                        {formatCurrency(staff.baseSalary)}
                      </span>
                    </div>

                    {(staff.bankName ||
                      staff.bankAccountNumber ||
                      staff.promptpayNumber) && (
                      <div className="bg-muted/10 border-border/40 space-y-1 rounded border p-2 text-xs">
                        {staff.bankName && (
                          <div className="text-foreground flex items-center gap-1 font-medium">
                            <IconBuildingBank className="text-muted-foreground size-3.5" />
                            {staff.bankName}
                          </div>
                        )}
                        {staff.bankAccountNumber && (
                          <div className="text-muted-foreground">
                            {tStaff('dialog.bankAccountNumber')}:{' '}
                            {staff.bankAccountNumber}
                          </div>
                        )}
                        {staff.promptpayNumber && (
                          <div className="text-muted-foreground">
                            {tStaff('accountPromptPay')}:{' '}
                            {staff.promptpayNumber}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-border/40 flex items-center gap-2 border-t pt-1">
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => handleOpenEdit(staff)}
                      >
                        <IconEdit className="mr-1 size-3.5" />
                        {tStaff('edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => handleToggle(staff)}
                      >
                        <IconPower className="mr-1 size-3.5" />
                        {staff.isActive ? tStaff('inactive') : tStaff('active')}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => handleDelete(staff)}
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <StaffSalaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        storeId={storeId}
        editingStaff={editingStaff}
      />
    </div>
  )
}
