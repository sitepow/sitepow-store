'use client'

import { FormProvider } from 'react-hook-form'

import { FieldGroup, FieldSet } from '@/components/ui/field'

import { BlogAiConfirmDialog } from './BlogAiConfirmDialog'
import { BlogBasicFieldsSection } from './BlogBasicFieldsSection'
import { BlogContentSection } from './BlogContentSection'
import { BlogFormHeader } from './BlogFormHeader'
import { BlogPreviewContent } from './BlogPreviewDialog'
import { BlogTagsSection } from './BlogTagsSection'
import { useCreateBlogForm } from '../_hooks/use-create-blog-form'

interface CreateBlogFormProps {
  blogId?: string
  onDataChange?: (data: {
    title: string
    content: string
    coverImage?: string
  }) => void
}

export function CreateBlogForm({ blogId, onDataChange }: CreateBlogFormProps) {
  const {
    form,
    handleSubmit,
    isDirty,
    currentStore,
    store,
    isPending,
    isGenAi,
    aiTaskConfirm,
    setAiTaskConfirm,
    handleAiTrigger,
    genAi,
    handleResetForm,
    handleImageChange,
    handleRemoveImage,
    previewImageUrl,
    onSubmit,
  } = useCreateBlogForm({ blogId, onDataChange })

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
        <BlogFormHeader
          isPending={isPending}
          isGenAi={isGenAi}
          isDirty={isDirty}
          onAiTrigger={handleAiTrigger}
          onGenAi={genAi}
          onResetForm={handleResetForm}
          onSubmit={handleSubmit(onSubmit)}
        />

        <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-2">
          <div className="space-y-8">
            <FieldSet disabled={isPending}>
              <FieldGroup className="grid gap-6">
                <BlogBasicFieldsSection
                  isPending={isPending}
                  isGenAi={isGenAi}
                  previewImageUrl={previewImageUrl}
                  onAiTrigger={handleAiTrigger}
                  onGenAi={genAi}
                  onImageChange={handleImageChange}
                  onRemoveImage={handleRemoveImage}
                />

                <BlogContentSection
                  isPending={isPending}
                  isGenAi={isGenAi}
                  onAiTrigger={handleAiTrigger}
                  onGenAi={genAi}
                />

                <BlogTagsSection
                  isPending={isPending}
                  isGenAi={isGenAi}
                  onAiTrigger={handleAiTrigger}
                  onGenAi={genAi}
                />
              </FieldGroup>
            </FieldSet>
          </div>

          <div className="sticky top-6 space-y-6 xl:col-span-1">
            <BlogPreviewContent />
          </div>
        </div>

        <BlogAiConfirmDialog
          aiTaskConfirm={aiTaskConfirm}
          primaryColor={primaryColor}
          onClose={() => setAiTaskConfirm(null)}
        />
      </FormProvider>
    </div>
  )
}
