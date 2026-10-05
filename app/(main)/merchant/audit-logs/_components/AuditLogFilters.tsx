'use client'

import { ACTOR_TYPE_TH, LOG_ACTION_TH } from '@/constants/i18n/translate'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import {
  IconBuildingStore,
  IconFilter,
  IconLock,
  IconPackage,
  IconReceipt,
  IconRotateClockwise,
  IconSearch,
  IconShoppingCart,
  IconUsers,
  IconX,
} from '@tabler/icons-react'

import {
  LOG_ACTION_CONFIG,
  LOG_CATEGORIES,
  LogCategory,
} from '@/utils/activity/formatter'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  totalCount?: number
  onReset: () => void
}

const CATEGORY_TABS: Array<{
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}> = [
  { id: 'all', label: 'ทั้งหมด', icon: IconFilter },
  { id: 'ORDER', label: 'ออเดอร์ & ขาย', icon: IconShoppingCart },
  { id: 'INVENTORY', label: 'คลังสินค้า & สต็อก', icon: IconPackage },
  { id: 'PRODUCT', label: 'จัดการสินค้า', icon: IconBuildingStore },
  { id: 'STAFF', label: 'พนักงาน & สิทธิ์', icon: IconUsers },
  { id: 'FINANCE', label: 'การเงิน & รายจ่าย', icon: IconReceipt },
  { id: 'SECURITY', label: 'ความปลอดภัย', icon: IconLock },
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
  totalCount,
  onReset,
}: AuditLogFiltersProps) {
  const hasActiveFilters =
    searchQuery !== '' ||
    actorFilter !== 'all' ||
    actionFilter !== 'all' ||
    selectedCategory !== 'all'

  // Actions available in dropdown: filtered by active category if selected
  const availableActions =
    selectedCategory !== 'all' && LOG_CATEGORIES[selectedCategory as LogCategory]
      ? LOG_CATEGORIES[selectedCategory as LogCategory].actions
      : (Object.keys(LOG_ACTION_TH) as LogAction[])

  return (
    <Card className="border bg-card/60 backdrop-blur-sm shadow-none">
      <CardContent className="p-4 space-y-3.5">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b pb-3">
          <span className="text-xs font-medium text-muted-foreground mr-1 hidden sm:inline">
            หมวดหมู่:
          </span>
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onCategoryChange(tab.id)
                  // If current action filter is not in this new category, reset actionFilter to 'all'
                  if (tab.id !== 'all' && actionFilter !== 'all') {
                    const catActions = LOG_CATEGORIES[tab.id as LogCategory]?.actions
                    if (catActions && !catActions.includes(actionFilter as LogAction)) {
                      onActionFilterChange('all')
                    }
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Inputs & Dropdowns Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search Field */}
          <div className="relative sm:col-span-2 lg:col-span-5">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="ค้นหาชื่อผู้ดำเนินการ, อีเมล, รหัสอ้างอิง, หรือ IP..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          {/* Action Filter */}
          <div className="lg:col-span-3">
            <Select
              value={actionFilter}
              onValueChange={(val) => onActionFilterChange(val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="ประเภทเหตุการณ์ (ทั้งหมด)" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">ทุกเหตุการณ์</SelectItem>
                {availableActions.map((action) => {
                  const meta = LOG_ACTION_CONFIG[action]
                  return (
                    <SelectItem key={action} value={action}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${meta?.color.dot ?? 'bg-muted-foreground'}`}
                        />
                        <span>{LOG_ACTION_TH[action] || action}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Actor Filter */}
          <div className="lg:col-span-2">
            <Select
              value={actorFilter}
              onValueChange={(val) => onActorFilterChange(val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="ผู้ดำเนินการ (ทั้งหมด)" />
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
          </div>

          {/* Reset & Status Count */}
          <div className="flex items-center justify-between sm:justify-end gap-2 lg:col-span-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <IconRotateClockwise size={13} />
                ล้างตัวกรอง
              </Button>
            )}
            {totalCount !== undefined && (
              <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
                {totalCount > 0 ? `พบ ${totalCount.toLocaleString()} รายการ` : 'ไม่พบรายการ'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
