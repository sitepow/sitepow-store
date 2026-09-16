import { UseFormReturn } from 'react-hook-form'

import {
  GenerateAffiliateProductInput,
  generateAffiliateProductAi,
  generateAnalyticsInsightsAi,
  generateBlogAi,
  generateCategoryAi,
  generateProductAi,
  generateStorePageAi,
  generateStoreSeoAi,
  scrapeAffiliateProductUrl,
} from '@/actions/ai'
import { DiscountType } from '@/generated/prisma/enums'
import { AiGenTask } from '@/types/ai'
import { BlogFormValues } from '@/zod/blog'
import { CreateCategoryFormValues } from '@/zod/category'
import { ProductFormValues } from '@/zod/product'
import { useMutation } from '@tanstack/react-query'

import { useAnalyticsOverview } from './analytics'

export function useProductAi(
  form: UseFormReturn<ProductFormValues>,
  task: AiGenTask,
  storeId: string,
) {
  return useMutation({
    mutationFn: async () => {
      const currentData = form.getValues()
      return await generateProductAi(currentData, task, storeId)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      }

      const aiData = result.data
      const currentValues = form.getValues()

      form.reset(
        {
          ...currentValues,
          ...(aiData.title && { title: aiData.title }),
          ...(aiData.slug && { slug: aiData.slug }),
          ...(aiData.tags && { tags: aiData.tags }),
          ...(aiData.metadata && { metadata: aiData.metadata }),
          ...(aiData.addons && { addons: aiData.addons }),
          ...(aiData.variants && {
            variants: aiData.variants.map(
              (v: ProductFormValues['variants'][number]) => ({
                ...v,
                price: v.price || 0,
                sku: v.sku || '',
                stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
                discount: {
                  active: false,
                  type: DiscountType.PERCENTAGE,
                  amount: 0,
                },
                rewardPoints: { isActive: false, amount: 0 },
                digitalItems: [],
                isAvailable: true,
                weight: 0,
                width: 0,
                height: 0,
                length: 0,
              }),
            ),
          }),
        },
        {
          keepDefaultValues: true,
        },
      )
    },
  })
}

export function useCategoryAi(
  form: UseFormReturn<CreateCategoryFormValues>,
  storeId: string,
) {
  return useMutation({
    mutationFn: async () => {
      const title = form.getValues('title')
      const description = form.getValues('description')

      return await generateCategoryAi({ title, description }, storeId)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      }

      const aiData = result.data
      const currentValues = form.getValues()

      form.reset(
        {
          ...currentValues,
          ...(aiData.title && { title: aiData.title }),
          ...(aiData.slug && { slug: aiData.slug }),
          ...(aiData.description && { description: aiData.description }),
        },
        {
          keepDefaultValues: true,
        },
      )
    },
  })
}

export function useBlogAi(
  form: UseFormReturn<BlogFormValues>,
  storeId: string,
) {
  return useMutation({
    mutationFn: async (task: AiGenTask) => {
      const currentData = form.getValues()
      return await generateBlogAi(currentData, task, storeId)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      }

      const aiData = result.data
      const currentValues = form.getValues()

      form.reset(
        {
          ...currentValues,
          ...(aiData.title && { title: aiData.title }),
          ...(aiData.slug && { slug: aiData.slug }),
          ...(aiData.tags && { tags: aiData.tags }),
          ...(aiData.content && { content: aiData.content }),
        },
        {
          keepDefaultValues: true,
        },
      )
    },
  })
}

type AnalyticsData = NonNullable<
  ReturnType<typeof useAnalyticsOverview>['data']
>

export function useAnalyticsAi(storeId: string) {
  return useMutation({
    mutationFn: async (data: AnalyticsData) => {
      return await generateAnalyticsInsightsAi(data, storeId)
    },
  })
}

export function useGenerateAffiliateProductAi() {
  return useMutation({
    mutationFn: async (input: GenerateAffiliateProductInput) => {
      return await generateAffiliateProductAi(input)
    },
  })
}

export function useScrapeAffiliateProduct() {
  return useMutation({
    mutationFn: async (url: string) => {
      return await scrapeAffiliateProductUrl(url)
    },
  })
}

export function useStoreSeoAi() {
  return useMutation({
    mutationFn: async ({
      storeName,
      storeDescription,
      storeId,
    }: {
      storeName: string
      storeDescription?: string
      storeId: string
    }) => {
      return await generateStoreSeoAi(storeName, storeDescription, storeId)
    },
  })
}

export function useStorePageAi() {
  return useMutation({
    mutationFn: async ({
      pageType,
      storeId,
      currentContent,
      customInstructions,
    }: {
      pageType:
        | 'about'
        | 'faqs'
        | 'description'
        | 'privacy-policy'
        | 'refund-return-policy'
      storeId: string
      currentContent?: string
      customInstructions?: string
    }) => {
      return await generateStorePageAi(
        pageType,
        storeId,
        currentContent,
        customInstructions,
      )
    },
  })
}
