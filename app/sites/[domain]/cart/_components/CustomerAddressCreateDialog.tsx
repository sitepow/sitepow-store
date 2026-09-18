'use client'

import React from 'react'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

import { useCustomerAddressForm } from '../_hooks/use-customer-address-form'
import { AddressBasicFields } from './AddressBasicFields'
import { AddressRegionFields } from './AddressRegionFields'
import { AddressTaxFields } from './AddressTaxFields'

export function CustomerAddressCreateDialog() {
  const t = useTranslations('customer.addresses')
  const tActions = useTranslations('common.actions')

  const {
    store,
    open,
    setOpen,
    form,
    isPending,
    isThai,
    country,
    showShippingFields,
    showTaxFields,
    handleClose,
    handleAddressAutoSelect,
    handleSubmit,
  } = useCustomerAddressForm()

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          <span>{t('addShippingTaxAddress')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-xl"
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('addAddress')}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="grid grid-cols-2 gap-x-5 gap-y-4 py-4">
            <AddressBasicFields
              form={form}
              isThai={isThai}
              country={country}
              showShippingFields={showShippingFields}
            />

            {showTaxFields && <AddressTaxFields form={form} />}

            <AddressRegionFields
              form={form}
              isThai={isThai}
              onAddressAutoSelect={handleAddressAutoSelect}
            />
          </FieldGroup>
          <DialogFooter className="flex flex-wrap border-t pt-5">
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isPending || !store?.slug}
            >
              {isPending ? (
                <>
                  <Spinner /> {tActions('saving')}
                </>
              ) : (
                t('saveAddressButton')
              )}
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={handleClose}
            >
              {tActions('cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
