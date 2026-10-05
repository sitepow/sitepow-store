'use client'

import { ACTOR_TYPE_TH, LOG_ACTION_TH } from '@/constants/i18n/translate'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { IconRotateClockwise, IconSearch, IconX } from '@tabler/icons-react'

import {
  LOG_CATEGORIES,
  LogCategory,
} from '@/utils/activity/formatter'
import { Button } from '@/components/ui/button'
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
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onReset: () => void
}

const CATEGORY_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'ทุกหมวดหมู่' },
  { id: 'ORDER', label: 'คำสั่งซื้อ & ขาย' },
  { id: 'INVENTORY', label: 'คลังสินค้า & สต็อก' },
  { id: 'PRODUCT', label: 'จัดการสินค้า' },
  { id: 'SETTINGS', label: 'ร้านค้า & ตั้งค่า' },
  { id: 'STAFF', label: 'พนักงาน & สิทธิ์' },
  { id: 'FINANCE', label: 'การเงิน & รายจ่าย' },
  { id: 'SECURITY', label: 'ความปลอดภัย' },
]

export function AuditLogFilters({
  searchQuery,
  onSearchQueryChange,
  actorFilter,
  onActorFilterChange,
  actionFilter,
  onActionFilterChange,
  selectedCategory,
  onCategoryChange,
  onReset,
}: AuditLogFiltersProps) {
  const hasActiveFilters =
    searchQuery !== '' ||
    actorFilter !== 'all' ||
    actionFilter !== 'all' ||
    selectedCategory !== 'all'

  const availableActions =
    selectedCategory !== 'all' && LOG_CATEGORIES[selectedCategory as LogCategory]
      ? LOG_CATEGORIES[selectedCategory as LogCategory].actions
      : (Object.keys(LOG_ACTION_TH) as LogAction[])

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-sm">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="ค้นหากิจกรรม, ผู้ดำเนินการ, รหัสอ้างอิง..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSearchQueryChange('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
          >
            <IconX size={14} />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedCategory}
          onValueChange={(cat) => {
            onCategoryChange(cat)
            if (cat !== 'all' && actionFilter !== 'all') {
              const catActions = LOG_CATEGORIES[cat as LogCategory]?.actions
              if (catActions && !catActions.includes(actionFilter as LogAction)) {
                onActionFilterChange('all')
              }
            }
          }}
        >
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder="หมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={actionFilter}
          onValueChange={(val) => onActionFilterChange(val)}
        >
          <SelectTrigger className="h-9 w-44 text-xs">
            <SelectValue placeholder="ประเภทกิจกรรม" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">ทุกกิจกรรม</SelectItem>
            {availableActions.map((action) => (
              <SelectItem key={action} value={action}>
                {LOG_ACTION_TH[action] || action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={actorFilter}
          onValueChange={(val) => onActorFilterChange(val)}
        >
          <SelectTrigger className="h-9 w-36 text-xs">
            <SelectValue placeholder="ผู้ดำเนินการ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ผู้ดำเนินการทั้งหมด</SelectItem>
            {(Object.keys(ACTOR_TYPE_TH) as ActorType[]).map((key) => (
              <SelectItem key={key} value={key}>
                {ACTOR_TYPE_TH[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs"
          >
            <IconRotateClockwise size={14} className="mr-1" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>
    </div>
  )
}
