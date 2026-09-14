'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useDeleteEmployeeSalaryConfig,
  useEmployeeSalaryConfigs,
  useSyncEmployeesFromStore,
  useToggleEmployeeSalaryConfigStatus,
} from '@/actions/hooks/payroll'
import { StatsCard } from '@/components/StatsCard'
import { SalaryType } from '@/generated/prisma/enums'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import {
  IconBuildingBank,
  IconCheck,
  IconCreditCard,
  IconEdit,
  IconPlus,
  IconPower,
  IconRefresh,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconWallet,
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
        toast.success(result.message || 'ดึงข้อมูลพนักงานสำเร็จ')
      } else {
        toast.error(result.message || 'ไม่สามารถดึงข้อมูลพนักงานได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน')
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
    if (
      !confirm(`คุณต้องการลบข้อมูลพนักงาน "${staff.employeeName}" ใช่หรือไม่?`)
    ) {
      return
    }

    try {
      const result = await deleteMutation.mutateAsync({
        id: staff.id,
        storeId,
      })

      if (result.success) {
        toast.success('ลบข้อมูลพนักงานเรียบร้อยแล้ว')
      } else {
        toast.error(result.message || 'ไม่สามารถลบข้อมูลได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล')
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
            ? `เปิดใช้งาน ${staff.employeeName} แล้ว`
            : `ปิดการใช้งาน ${staff.employeeName} แล้ว`,
        )
      } else {
        toast.error(result.message || 'ไม่สามารถเปลี่ยนสถานะได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ')
    }
  }

  const getSalaryTypeBadge = (type: SalaryType) => {
    switch (type) {
      case SalaryType.MONTHLY:
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-600">
            รายเดือน
          </Badge>
        )
      case SalaryType.DAILY:
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-600">
            รายวัน
          </Badge>
        )
      case SalaryType.HOURLY:
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 text-emerald-600"
          >
            รายชั่วโมง
          </Badge>
        )
      case SalaryType.COMMISSION:
        return (
          <Badge
            variant="outline"
            className="border-purple-200 text-purple-600"
          >
            คอมมิชชั่น
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards with StatsCard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="จำนวนพนักงานทั้งหมด"
          value={`${staffList.length} คน`}
          description="พนักงานที่ลงทะเบียนในระบบ"
          icon={IconUsers}
        />
        <StatsCard
          title="ฐานเงินเดือนรวมต่อเดือน"
          value={formatCurrency(totalBase)}
          description="เฉพาะพนักงานที่เปิดใช้งานอยู่"
          icon={IconWallet}
          valueClassName="text-primary font-bold"
        />
        <StatsCard
          title="พนักงานที่เปิดใช้งาน"
          value={`${activeStaff.length} / ${staffList.length} คน`}
          description="พร้อมสำหรับการตัดรอบเงินเดือน"
          icon={IconUserCheck}
          badge={
            activeStaff.length === staffList.length ? 'ครบทุกคน' : 'มีปิดใช้งาน'
          }
        />
      </div>

      {/* 2. Main Table / List Card */}
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUser className="text-primary size-5" />
              รายชื่อพนักงานและฐานเงินเดือน
            </CardTitle>
            <CardDescription>
              กำหนดค่าจ้าง ตำแหน่ง บัญชีธนาคาร และสิทธิประโยชน์ของพนักงานในร้าน
            </CardDescription>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncFromEmployees}
              disabled={syncEmployeesMutation.isPending}
              className="flex-1 text-xs sm:flex-initial"
              title="ดึงข้อมูลพนักงานจากหน้าระบบจัดการพนักงาน (/merchant/employee)"
            >
              <IconRefresh className="mr-1 size-3.5" />
              {syncEmployeesMutation.isPending
                ? 'กำลังดึงข้อมูล...'
                : 'ดึงพนักงานจากระบบ'}
            </Button>
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="flex-1 text-xs sm:flex-initial"
            >
              <IconPlus className="mr-1 size-3.5" />
              เพิ่มพนักงานใหม่
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-8 text-center text-sm">
              กำลังโหลดข้อมูลพนักงาน...
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-sm">
              ยังไม่มีข้อมูลพนักงาน กดปุ่ม &quot;เพิ่มพนักงานใหม่&quot;
              เพื่อเริ่มต้น
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (hidden on mobile) */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>พนักงาน / รหัส</TableHead>
                      <TableHead>แผนก & ตำแหน่ง</TableHead>
                      <TableHead>ประเภทการจ้าง</TableHead>
                      <TableHead className="text-right">ฐานเงินเดือน</TableHead>
                      <TableHead>ข้อมูลรับเงิน</TableHead>
                      <TableHead className="text-center">สถานะ</TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
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
                            {staff.department || 'ไม่ระบุแผนก'}
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
                                บัญชี: {staff.bankAccountNumber}
                              </div>
                            )}
                            {staff.promptpayNumber && (
                              <div className="text-muted-foreground">
                                พร้อมเพย์: {staff.promptpayNumber}
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
                              ทำงานอยู่
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              พักงาน/ปิด
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title={
                                staff.isActive
                                  ? 'ปิดการใช้งาน'
                                  : 'เปิดการใช้งาน'
                              }
                              onClick={() => handleToggle(staff)}
                            >
                              <IconPower
                                className={`size-4 ${
                                  staff.isActive
                                    ? 'text-emerald-600'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title="แก้ไขข้อมูล"
                              onClick={() => handleOpenEdit(staff)}
                            >
                              <IconEdit className="text-muted-foreground size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-rose-500 hover:text-rose-600"
                              title="ลบพนักงาน"
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
                          {staff.position || 'พนักงาน'}
                          {staff.department ? ` (${staff.department})` : ''}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {staff.isActive ? (
                          <Badge className="border-emerald-200 bg-emerald-500/10 text-xs text-emerald-600">
                            ทำงานอยู่
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground text-xs"
                          >
                            ปิดใช้งาน
                          </Badge>
                        )}
                        {getSalaryTypeBadge(staff.salaryType)}
                      </div>
                    </div>

                    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-2.5 text-sm">
                      <span className="text-muted-foreground text-xs">
                        ฐานเงินเดือน:
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
                            เลขบัญชี: {staff.bankAccountNumber}
                          </div>
                        )}
                        {staff.promptpayNumber && (
                          <div className="text-muted-foreground">
                            พร้อมเพย์: {staff.promptpayNumber}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-border/40 flex items-center gap-2 border-t pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleOpenEdit(staff)}
                      >
                        <IconEdit className="mr-1 size-3.5" />
                        แก้ไข
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleToggle(staff)}
                      >
                        <IconPower className="mr-1 size-3.5" />
                        {staff.isActive ? 'ปิดพักงาน' : 'เปิดใช้งาน'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 text-xs text-rose-500"
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
