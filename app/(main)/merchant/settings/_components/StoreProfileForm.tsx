'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconBuildingStore } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ALL_STORES } from '@/stores/use-store-filter'

import { StoreBasicInfoSection } from './StoreBasicInfoSection'
import { StoreBrandingSection } from './StoreBrandingSection'
import { StoreSeoSection } from './StoreSeoSection'
import { useStoreProfileForm } from '../_hooks/use-store-profile-form'

export function StoreProfileForm() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.storeProfile')

  const {
    form,
    selectedStoreId,
    logoInputRef,
    bannerInputRef,
    logo,
    coverImage,
    isVideo,
    previewLogoUrl,
    previewBannerUrl,
    isPending,
    isGeneratingSeo,
    resetForm,
    onSubmit,
    handleGenerateSeo,
  } = useStoreProfileForm()

  const {
    handleSubmit,
    formState: { isDirty },
  } = form

  return (
    <Card
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconBuildingStore}
          title={t('title')}
          description={t('description')}
        />
      </CardHeader>

      {selectedStoreId === ALL_STORES ? (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <StoreBrandingSection
              form={form}
              logoInputRef={logoInputRef}
              bannerInputRef={bannerInputRef}
              logo={logo}
              coverImage={coverImage}
              previewLogoUrl={previewLogoUrl}
              previewBannerUrl={previewBannerUrl}
              isVideo={Boolean(isVideo)}
            />

            <Separator />

            <StoreBasicInfoSection form={form} isPending={isPending} />

            <Separator />

            <StoreSeoSection
              form={form}
              isPending={isPending}
              isGeneratingSeo={isGeneratingSeo}
              onGenerateSeo={handleGenerateSeo}
            />
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isPending}
              >
                {t('reset')}
              </Button>
            )}
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner /> {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
