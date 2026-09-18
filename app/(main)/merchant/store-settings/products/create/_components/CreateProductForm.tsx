'use client'

import { FormProvider } from 'react-hook-form'

import { ImageUploadSection } from './ImageUploadSection'
import { ProductAddonsSection } from './ProductAddonsSection'
import { ProductAiConfirmDialog } from './ProductAiConfirmDialog'
import { ProductBasicInfoSection } from './ProductBasicInfoSection'
import { ProductFormHeader } from './ProductFormHeader'
import { ProductMetadataTagsSection } from './ProductMetadataTagsSection'
import { ProductPreviewContent } from './ProductPreviewContent'
import { ProductVariantsSection } from './ProductVariantsSection'
import { useCreateProductForm } from '../_hooks/use-create-product-form'

export function CreateProductForm({ productId }: { productId?: string }) {
  const {
    form,
    handleSubmit,
    isDirty,
    currentStore,
    store,
    selectedStoreId,
    isPending,
    aiTaskConfirm,
    setAiTaskConfirm,
    handleAiTrigger,
    genAll,
    isGenAll,
    genSlug,
    genMeta,
    isGenMeta,
    genTags,
    isGenTags,
    genAddons,
    isGenAddons,
    genVariants,
    isGenVariants,
    handleResetForm,
    handleApplyPreset,
    variantFields,
    appendVariant,
    removeVariant,
    addonFields,
    appendAddon,
    removeAddon,
    metadataFields,
    appendMetadata,
    removeMetadata,
    onSubmit,
  } = useCreateProductForm({ productId })

  const primaryColor = currentStore?.primaryColor ?? store?.primaryColor

  return (
    <div
      style={
        {
          '--primary': primaryColor,
        } as React.CSSProperties
      }
    >
      <FormProvider {...form}>
        <ProductFormHeader
          selectedStoreId={selectedStoreId}
          isDirty={isDirty}
          isPending={isPending}
          isGenAll={isGenAll}
          onAiTrigger={handleAiTrigger}
          onGenAll={() => genAll()}
          onGenSlug={() => genSlug()}
          onApplyPreset={handleApplyPreset}
          onResetForm={handleResetForm}
          onSubmit={handleSubmit(onSubmit)}
        />

        <div className="text-foreground grid grid-cols-1 items-start gap-10 xl:grid-cols-2">
          <div className="space-y-10">
            <ProductBasicInfoSection
              isPending={isPending}
              onAiTrigger={handleAiTrigger}
            />

            <ImageUploadSection />

            <ProductVariantsSection
              variantFields={variantFields}
              appendVariant={appendVariant}
              removeVariant={removeVariant}
              isGenVariants={isGenVariants}
              onAiTrigger={handleAiTrigger}
              onGenVariants={() => genVariants()}
            />

            <ProductMetadataTagsSection
              metadataFields={metadataFields}
              appendMetadata={appendMetadata}
              removeMetadata={removeMetadata}
              isPending={isPending}
              isGenMeta={isGenMeta}
              isGenTags={isGenTags}
              onAiTrigger={handleAiTrigger}
              onGenMeta={() => genMeta()}
              onGenTags={() => genTags()}
            />

            <ProductAddonsSection
              addonFields={addonFields}
              appendAddon={appendAddon}
              removeAddon={removeAddon}
              isPending={isPending}
              isGenAddons={isGenAddons}
              onAiTrigger={handleAiTrigger}
              onGenAddons={() => genAddons()}
            />
          </div>

          <div className="sticky top-6 space-y-6 xl:col-span-1">
            <ProductPreviewContent />
          </div>
        </div>

        <ProductAiConfirmDialog
          aiTaskConfirm={aiTaskConfirm}
          onClose={() => setAiTaskConfirm(null)}
          primaryColor={primaryColor}
        />
      </FormProvider>
    </div>
  )
}
