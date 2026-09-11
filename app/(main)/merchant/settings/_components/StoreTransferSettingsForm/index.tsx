'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconMail, IconReplace } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { StoreTransferConfirmDialog } from './_components/StoreTransferConfirmDialog'
import { StoreTransferHistoryTable } from './_components/StoreTransferHistoryTable'

export function StoreTransferSettingsForm() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.transfer')
  const { selectedStoreId } = useStoreFilter()
  const [email, setEmail] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div
      className="space-y-6"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconReplace}
            title={t('title')}
            description={t('description')}
          />
        </CardHeader>

        {selectedStoreId !== ALL_STORES && (
          <>
            <CardContent className="space-y-5">
              <ActionRequiredAlert
                title={t('warningTitle')}
                description={t('warningDesc')}
              />
              <Field>
                <FieldLabel>{t('email')}</FieldLabel>
                <Input
                  type="email"
                  placeholder="example@merchant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </CardContent>

            <CardFooter className="flex justify-end border-t">
              <Button
                variant="destructive"
                size="sm"
                disabled={!email}
                onClick={() => setConfirmOpen(true)}
              >
                <IconMail size={14} />
                {t('submit')}
              </Button>
            </CardFooter>
          </>
        )}
        {selectedStoreId === ALL_STORES && (
          <CardContent>
            <ActionRequiredAlert />
          </CardContent>
        )}
      </Card>
      {selectedStoreId !== ALL_STORES && (
        <>
          <StoreTransferHistoryTable />
          <StoreTransferConfirmDialog
            open={confirmOpen}
            toEmail={email}
            storeId={selectedStoreId as string}
            onClose={() => {
              setConfirmOpen(false)
              setEmail('')
            }}
          />
        </>
      )}
    </div>
  )
}
