'use client'

import React from 'react'
import { Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconBuildingStore, IconPlus } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { useBranchDialogForm } from '../_hooks/use-branch-dialog-form'
import { BranchAddressSection } from './BranchAddressSection'
import { BranchOpeningHoursSection } from './BranchOpeningHoursSection'

interface BranchDialogProps {
  branchId?: string
  open: boolean
  setOpen: (v: boolean) => void
  onAdd?: () => void
}

export function BranchDialog({
  branchId,
  open,
  setOpen,
  onAdd,
}: BranchDialogProps) {
  const t = useTranslations('merchant.branches')
  const tCommon = useTranslations('common.actions')

  const {
    currentStore,
    store,
    form,
    register,
    control,
    watch,
    errors,
    fields,
    mapUrl,
    isPending,
    handleAddressAutoSelect,
    handleClose,
    handleSubmit,
  } = useBranchDialogForm({
    branchId,
    open,
    setOpen,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={onAdd}>
          <IconPlus className="size-4" />
          {t('addBranch')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconBuildingStore}
            title={branchId ? t('editBranch') : t('addBranch')}
            description={t('dialog.description')}
          />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FieldLabel className="text-base">
                {t('dialog.isMainLabel')}
              </FieldLabel>
              <p className="text-muted-foreground text-xs">
                {t('dialog.isMainDesc')}
              </p>
            </div>
            <Controller
              control={control}
              name="isMain"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <BranchAddressSection
            register={register}
            control={control}
            errors={errors}
            onAddressAutoSelect={handleAddressAutoSelect}
          />

          <BranchOpeningHoursSection
            fields={fields}
            register={register}
            control={control}
            watch={watch}
          />

          <Field>
            <FieldLabel>{t('dialog.mapUrlLabel')}</FieldLabel>
            <Input
              placeholder={t('dialog.mapUrlPlaceholder')}
              {...register('mapUrl')}
            />
          </Field>

          {mapUrl && mapUrl.includes('google.com/maps') && (
            <div className="border-primary h-48 w-full overflow-hidden rounded-lg border">
              <iframe src={mapUrl} className="h-full w-full" loading="lazy" />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
