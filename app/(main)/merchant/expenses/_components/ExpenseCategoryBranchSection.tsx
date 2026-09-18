'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { EXPENSE_CATEGORY_TH } from '@/constants/translate'
import { ExpenseCategory } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BranchOption {
  id: string
  name: string
}

interface ExpenseCategoryBranchSectionProps {
  currentCategory: ExpenseCategory
  onCategoryChange: (val: ExpenseCategory) => void
  categoryError?: string
  currentBranchId: string | null | undefined
  onBranchChange: (val: string | null) => void
  branches: BranchOption[]
  isPending: boolean
}

export function ExpenseCategoryBranchSection({
  currentCategory,
  onCategoryChange,
  categoryError,
  currentBranchId,
  onBranchChange,
  branches,
  isPending,
}: ExpenseCategoryBranchSectionProps) {
  const t = useTranslations('merchant.expenses')
  const tCategories = useTranslations('merchant.expenses.categories')

  return (
    <>
      <Field>
        <FieldLabel>{t('dialog.categoryLabel')}</FieldLabel>
        <Select
          value={currentCategory}
          disabled={isPending}
          onValueChange={(val) => onCategoryChange(val as ExpenseCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('dialog.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPENSE_CATEGORY_TH).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {tCategories.has(key as Parameters<typeof tCategories>[0])
                  ? tCategories(key as Parameters<typeof tCategories>[0])
                  : label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{categoryError}</FieldError>
      </Field>

      {branches.length > 0 && (
        <Field>
          <FieldLabel>{t('dialog.branchLabel')}</FieldLabel>
          <Select
            value={currentBranchId || ALL_BRANCHES}
            disabled={isPending}
            onValueChange={(val) =>
              onBranchChange(val === ALL_BRANCHES ? null : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allBranches')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_BRANCHES}>{t('allBranches')}</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    </>
  )
}
