'use client'

import { ACTOR_TYPE_TH, LOG_ACTION_TH } from '@/constants/translate'
import { ActorType, LogAction } from '@/generated/prisma/enums'
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
      <CardContent className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
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
              {(Object.keys(ACTOR_TYPE_TH) as ActorType[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {ACTOR_TYPE_TH[key]}
                </SelectItem>
              ))}
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
              {(Object.keys(LOG_ACTION_TH) as LogAction[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {LOG_ACTION_TH[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  )
}
