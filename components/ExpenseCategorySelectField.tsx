import { useTranslations } from 'next-intl'

import { EXPENSE_CATEGORY_TH } from '@/constants/translate'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconCategory } from '@tabler/icons-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Field, FieldLabel } from './ui/field'

interface ExpenseCategorySelectFieldProps {
  value: string
  onValueChange: (value: string) => void
}

export function ExpenseCategorySelectField({
  value,
  onValueChange,
}: ExpenseCategorySelectFieldProps) {
  const t = useTranslations('merchant.expenses')
  const tCategories = useTranslations('merchant.expenses.categories')
  const isMounted = useIsMounted()

  if (!isMounted) {
    return null
  }

  return (
    <Field className="text-foreground w-full sm:w-fit">
      <FieldLabel>
        <IconCategory size={14} />
        {t('categoryFilterLabel')}
      </FieldLabel>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder={t('allCategories')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t('allCategories')}</SelectItem>
          {Object.entries(EXPENSE_CATEGORY_TH).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {tCategories.has(key as any) ? tCategories(key as any) : label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
