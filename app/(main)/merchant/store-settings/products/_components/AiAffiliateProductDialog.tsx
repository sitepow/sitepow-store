'use client'

import { IconSparkles } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'

import { AiAffiliateDialogFooter } from './AiAffiliateDialogFooter'
import { AiAffiliateInputStep } from './AiAffiliateInputStep'
import { AiAffiliatePreviewStep } from './AiAffiliatePreviewStep'
import { AiAffiliateStepIndicator } from './AiAffiliateStepIndicator'
import { useAiAffiliateProductForm } from '../_hooks/use-ai-affiliate-product-form'

interface AiAffiliateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onSuccess?: () => void
}

export function AiAffiliateProductDialog({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: AiAffiliateProductDialogProps) {
  const {
    t,
    currentStore,
    store,
    categories,
    step,
    setStep,
    productUrl,
    rawTitle,
    setRawTitle,
    affiliateUrl,
    setAffiliateUrl,
    selectedCategoryId,
    setSelectedCategoryId,
    platform,
    setPlatform,
    notes,
    setNotes,
    liveScraped,
    loadingStepIndex,
    title,
    setTitle,
    slug,
    setSlug,
    price,
    setPrice,
    originalPrice,
    setOriginalPrice,
    isOnSale,
    setIsOnSale,
    discountText,
    setDiscountText,
    platformLabel,
    setPlatformLabel,
    images,
    primaryImageIndex,
    videoUrl,
    setVideoUrl,
    tags,
    setTags,
    description,
    setDescription,
    specs,
    destinationUrl,
    setDestinationUrl,
    newImageUrl,
    setNewImageUrl,
    isAddingImageUrl,
    setIsAddingImageUrl,
    hasDraft,
    imageFileInputRef,
    videoFileInputRef,
    isGenerating,
    isScraping,
    isSaving,
    isUploadingImage,
    isUploadingVideo,
    handleUrlInputChange,
    handleFetchLive,
    handleUseLiveDirectly,
    handleGenerate,
    handleImageUpload,
    handleVideoUpload,
    handleAddImageUrl,
    handleSetPrimary,
    handleRemoveImage,
    handleAddSpec,
    handleRemoveSpec,
    handleUpdateSpec,
    handleSaveProduct,
    handleClearDraft,
  } = useAiAffiliateProductForm({ storeId, onOpenChange, onSuccess })

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          onOpenChange(false)
        }
      }}
    >
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="flex max-h-[94vh] w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:w-full sm:max-w-3xl"
      >
        <DialogHeader className="bg-muted/20 border-b p-3.5 text-left sm:p-6">
          <div className="flex flex-col gap-2.5">
            <DialogHeaderIcon
              icon={IconSparkles}
              title={t('title')}
              description={t('description')}
              className="pr-6 sm:pr-0"
            />
            <AiAffiliateStepIndicator
              step={step}
              title={title}
              hasDraft={hasDraft}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
          {step === 'input' ? (
            <AiAffiliateInputStep
              isGenerating={isGenerating}
              isScraping={isScraping}
              loadingStepIndex={loadingStepIndex}
              productUrl={productUrl}
              rawTitle={rawTitle}
              affiliateUrl={affiliateUrl}
              selectedCategoryId={selectedCategoryId}
              platform={platform}
              notes={notes}
              categories={categories}
              liveScraped={liveScraped}
              onUrlInputChange={handleUrlInputChange}
              onRawTitleChange={setRawTitle}
              onAffiliateUrlChange={setAffiliateUrl}
              onCategoryChange={setSelectedCategoryId}
              onPlatformChange={setPlatform}
              onNotesChange={setNotes}
              onFetchLive={() => handleFetchLive()}
              onUseLiveDirectly={handleUseLiveDirectly}
              onGenerate={handleGenerate}
            />
          ) : (
            <AiAffiliatePreviewStep
              title={title}
              slug={slug}
              price={price}
              originalPrice={originalPrice}
              platform={platform}
              platformLabel={platformLabel}
              isOnSale={isOnSale}
              discountText={discountText}
              images={images}
              primaryImageIndex={primaryImageIndex}
              videoUrl={videoUrl}
              tags={tags}
              description={description}
              specs={specs}
              destinationUrl={destinationUrl}
              newImageUrl={newImageUrl}
              isAddingImageUrl={isAddingImageUrl}
              isUploadingImage={isUploadingImage}
              isUploadingVideo={isUploadingVideo}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              imageFileInputRef={imageFileInputRef}
              videoFileInputRef={videoFileInputRef}
              onTitleChange={setTitle}
              onSlugChange={setSlug}
              onPriceChange={setPrice}
              onOriginalPriceChange={setOriginalPrice}
              onPlatformChange={setPlatform}
              onPlatformLabelChange={setPlatformLabel}
              onIsOnSaleChange={setIsOnSale}
              onDiscountTextChange={setDiscountText}
              onCategoryChange={setSelectedCategoryId}
              onDestinationUrlChange={setDestinationUrl}
              onTagsChange={setTags}
              onDescriptionChange={setDescription}
              onSetPrimary={handleSetPrimary}
              onRemoveImage={handleRemoveImage}
              onImageUpload={handleImageUpload}
              onVideoUpload={handleVideoUpload}
              onAddImageUrl={handleAddImageUrl}
              onToggleAddImageUrl={() => setIsAddingImageUrl(!isAddingImageUrl)}
              onNewImageUrlChange={setNewImageUrl}
              onVideoUrlChange={setVideoUrl}
              onAddSpec={handleAddSpec}
              onRemoveSpec={handleRemoveSpec}
              onUpdateSpec={handleUpdateSpec}
            />
          )}
        </div>

        <AiAffiliateDialogFooter
          step={step}
          hasDraft={hasDraft}
          isGenerating={isGenerating}
          isSaving={isSaving}
          productUrl={productUrl}
          title={title}
          onClose={() => onOpenChange(false)}
          onClearDraft={handleClearDraft}
          onGenerate={handleGenerate}
          onBackToInput={() => setStep('input')}
          onSaveProduct={handleSaveProduct}
        />
      </DialogContent>
    </Dialog>
  )
}
