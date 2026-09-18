'use client'

import React from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { IconPlus, IconRefresh, IconUser, IconUsers } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

interface StaffSalaryEmptyStateProps {
  isSyncing: boolean
  onSyncFromEmployees: () => void
  onOpenAdd: () => void
}

export function StaffSalaryEmptyState({
  isSyncing,
  onSyncFromEmployees,
  onOpenAdd,
}: StaffSalaryEmptyStateProps) {
  const tStaff = useTranslations('merchant.payroll.staff')

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-10 text-center">
      <IconUsers className="text-muted-foreground/40 size-10" />
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">{tStaff('empty')}</p>
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
          onClick={onSyncFromEmployees}
          disabled={isSyncing}
        >
          <IconRefresh className="mr-1.5 size-3.5" />
          {isSyncing ? tStaff('dialog.saving') : tStaff('syncFromEmployees')}
        </Button>
        <Button size="sm" onClick={onOpenAdd}>
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
  )
}
