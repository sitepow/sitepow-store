'use client'

import { IconFilter, IconSearch } from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AuditLogFiltersProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  actorFilter: string
  onActorFilterChange: (value: string) => void
  actionFilter: string
  onActionFilterChange: (value: string) => void
}

export function AuditLogFilters({
  searchQuery,
  onSearchQueryChange,
  actorFilter,
  onActorFilterChange,
  actionFilter,
  onActionFilterChange,
}: AuditLogFiltersProps) {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Field>
          <FieldLabel>
            <IconSearch size={14} /> ค้นหาพนักงาน / Entity ID
          </FieldLabel>
          <Input
            placeholder="พิมพ์ค้นหาชื่อ, รหัสเป้าหมาย..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="bg-background h-9 text-xs"
          />
        </Field>

        <Field>
          <FieldLabel>
            <IconFilter size={14} /> กรองผู้ดำเนินการ (Actor Group)
          </FieldLabel>
          <Select value={actorFilter} onValueChange={onActorFilterChange}>
            <SelectTrigger className="bg-background h-9">
              <SelectValue placeholder="ทั้งหมดทุกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมดทุกประเภท</SelectItem>
              <SelectItem value="MERCHANT">
                Merchant (เจ้าของร้าน / พนักงาน)
              </SelectItem>
              <SelectItem value="SYSTEM">
                System (ระบบอัตโนมัติ / AI)
              </SelectItem>
              <SelectItem value="SUPER_ADMIN">
                Super Admin (ทีมผู้ดูแลระบบกลาง)
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>
            <IconFilter size={14} /> กรองตามประเภทเหตุการณ์ (Action)
          </FieldLabel>
          <Select value={actionFilter} onValueChange={onActionFilterChange}>
            <SelectTrigger className="bg-background h-9">
              <SelectValue placeholder="ทุกเหตุการณ์" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกเหตุการณ์</SelectItem>
              <SelectItem value="UPDATE_STOCK">
                การจัดการคลังสต็อก (UPDATE_STOCK)
              </SelectItem>
              <SelectItem value="MANAGE_STAFF">
                การตั้งค่าสิทธิ์พนักงาน (MANAGE_STAFF)
              </SelectItem>
              <SelectItem value="CREATE_ORDER">
                การออกออเดอร์ใหม่ (CREATE_ORDER)
              </SelectItem>
              <SelectItem value="DELETE_PRODUCT">
                การลบข้อมูลสินค้าออกจากระบบ (DELETE_PRODUCT)
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  )
}
