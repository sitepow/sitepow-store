'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useDeleteEmployeeSalaryConfig,
  useEmployeeSalaryConfigs,
  useSyncEmployeesFromStore,
  useToggleEmployeeSalaryConfigStatus,
} from '@/actions/hooks/payroll'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import { IconPlus, IconRefresh, IconUser } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { StaffSalaryDesktopTable } from './StaffSalaryDesktopTable'
import { StaffSalaryDialog } from './StaffSalaryDialog'
import { StaffSalaryEmptyState } from './StaffSalaryEmptyState'
import { StaffSalaryMobileList } from './StaffSalaryMobileList'
import { StaffSalarySummaryCards } from './StaffSalarySummaryCards'

interface StaffSalaryTableProps {
  storeId: string
}

export function StaffSalaryTable({ storeId }: StaffSalaryTableProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
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

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <StaffSalarySummaryCards staffList={staffList} />

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
            <StaffSalaryEmptyState
              isSyncing={syncEmployeesMutation.isPending}
              onSyncFromEmployees={handleSyncFromEmployees}
              onOpenAdd={handleOpenAdd}
            />
          ) : (
            <>
              <StaffSalaryDesktopTable
                staffList={staffList}
                onOpenEdit={handleOpenEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
              <StaffSalaryMobileList
                staffList={staffList}
                onOpenEdit={handleOpenEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
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
