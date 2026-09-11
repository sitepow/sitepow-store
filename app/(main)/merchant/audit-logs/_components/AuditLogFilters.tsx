'use client'

import { useTranslations } from 'next-intl'

import { ACTOR_TYPE_TH, LOG_ACTION_TH } from '@/constants/translate'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.auditLogs')

  return (
    <Card
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <CardContent className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Field>
          <FieldLabel>
            <IconSearch size={14} /> {t('filters.searchLabel')}
          </FieldLabel>
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>
            <IconFilter size={14} /> {t('filters.actorGroupLabel')}
          </FieldLabel>
          <Select value={actorFilter} onValueChange={onActorFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('filters.allActors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allActors')}</SelectItem>
              {(Object.keys(ACTOR_TYPE_TH) as ActorType[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {t.has(`actorTypes.${key}`)
                    ? t(`actorTypes.${key}`)
                    : ACTOR_TYPE_TH[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>
            <IconFilter size={14} /> {t('filters.actionTypeLabel')}
          </FieldLabel>
          <Select value={actionFilter} onValueChange={onActionFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('filters.allActions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allActions')}</SelectItem>
              {(Object.keys(LOG_ACTION_TH) as LogAction[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {t.has(`actions.${key}`)
                    ? t(`actions.${key}`)
                    : LOG_ACTION_TH[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  )
}
