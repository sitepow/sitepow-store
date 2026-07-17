import { UseFormReturn } from 'react-hook-form'

import { generateProductAiAction } from '@/actions/ai'
import { DiscountType } from '@/generated/prisma/enums'
import { AiGenTask } from '@/types/ai'
import { ProductFormValues } from '@/zod/product'
import { useMutation } from '@tanstack/react-query'

export function useProductAi(
  form: UseFormReturn<ProductFormValues>,
  task: AiGenTask,
) {
  return useMutation({
    mutationFn: async () => {
      const currentData = form.getValues()
      return await generateProductAiAction(currentData, task)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      }

      const aiData = result.data
      const currentValues = form.getValues()

      form.reset({
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
      })
    },
  })
}
