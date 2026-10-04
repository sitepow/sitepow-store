import { EXPENSE_CATEGORY_TH } from '@/constants/i18n/translate'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconCategory } from '@tabler/icons-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Field, FieldLabel } from '@/components/./ui/field'

interface ExpenseCategorySelectFieldProps {
  value: string
  onValueChange: (value: string) => void
}

export function ExpenseCategorySelectField({
  value,
  onValueChange,
}: ExpenseCategorySelectFieldProps) {
  const isMounted = useIsMounted()

  if (!isMounted) {
    return null
  }

  return (
    <Field className="text-foreground w-full sm:w-fit">
      <FieldLabel>
        <IconCategory size={14} />
        เลือกหมวดหมู่
      </FieldLabel>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">หมวดหมู่ทั้งหมด</SelectItem>
          {Object.entries(EXPENSE_CATEGORY_TH).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
