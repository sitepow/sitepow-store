'use server'

import { GEMINI_MODEL } from '@/constants/ai'
import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { Plan } from '@/generated/prisma/enums'
import { AiGenTask, CreditUsageType } from '@/types/ai'
import { estimateCost } from '@/utils/ai'
import { ProductFormValues } from '@/zod/product'
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    slug: { type: SchemaType.STRING },
    variants: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER },
          stock: { type: SchemaType.NUMBER },
          sku: { type: SchemaType.STRING },
          discount: {
            type: SchemaType.OBJECT,
            properties: {
              active: { type: SchemaType.BOOLEAN },
              type: { type: SchemaType.STRING },
              amount: { type: SchemaType.NUMBER },
            },
            required: ['active', 'type', 'amount'],
          },
          rewardPoints: {
            type: SchemaType.OBJECT,
            properties: {
              isActive: { type: SchemaType.BOOLEAN },
              amount: { type: SchemaType.NUMBER },
            },
            required: ['isActive', 'amount'],
          },
        },
      },
    },
    addons: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER },
          isAvailable: { type: SchemaType.BOOLEAN },
        },
        required: ['title', 'price', 'isAvailable'],
      },
    },
    metadata: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          key: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING },
        },
        required: ['key', 'value'],
      },
    },
    tags: { type: SchemaType.STRING },
  },
  required: ['title', 'slug', 'variants', 'metadata'],
} as const

const SCHEMA_PARTS: Record<AiGenTask, Schema> = {
  [AiGenTask.TITLE]: {
    type: SchemaType.OBJECT,
    properties: { title: { type: SchemaType.STRING } },
    required: ['title'],
  },
  [AiGenTask.SLUG]: {
    type: SchemaType.OBJECT,
    properties: { slug: { type: SchemaType.STRING } },
    required: ['slug'],
  },
  [AiGenTask.METADATA]: {
    type: SchemaType.OBJECT,
    properties: {
      metadata: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            key: { type: SchemaType.STRING },
            value: { type: SchemaType.STRING },
          },
          required: ['key', 'value'],
        },
      },
    },
    required: ['metadata'],
  },
  [AiGenTask.ADDONS]: {
    type: SchemaType.OBJECT,
    properties: {
      addons: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            price: { type: SchemaType.NUMBER },
            isAvailable: { type: SchemaType.BOOLEAN },
          },
          required: ['title', 'price', 'isAvailable'],
        },
      },
    },
    required: ['addons'],
  },
  [AiGenTask.VARIANTS]: {
    type: SchemaType.OBJECT,
    properties: {
      variants: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            price: { type: SchemaType.NUMBER },
            sku: { type: SchemaType.STRING },
          },
          required: ['title', 'price'],
        },
      },
    },
    required: ['variants'],
  },
  [AiGenTask.TAGS]: {
    type: SchemaType.OBJECT,
    properties: {
      tags: { type: SchemaType.STRING },
    },
    required: ['tags'],
  },
  [AiGenTask.ALL]: SCHEMA,
} as const

export async function generateProductAiAction(
  currentData: Partial<ProductFormValues>,
  task: AiGenTask,
) {
  try {
    const { title, images } = currentData
    const imageUrls =
      images
        ?.map((img) => img.url)
        .filter(
          (url): url is string =>
            typeof url === 'string' && url.startsWith('http'),
        ) || []
    const imageParts = imageUrls.map((url) => ({
      fileData: { fileUri: url, mimeType: 'image/jpeg' },
    }))

    const responseSchema = task === AiGenTask.ALL ? SCHEMA : SCHEMA_PARTS[task]

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    })

    const availableKeys = PRODUCT_METADATA_MASTER.flatMap((g) => g.fields).map(
      (f) => `${f.key} (${f.label})`,
    )

    const prompt = `คุณคือผู้เชี่ยวชาญด้านการตลาด "โปรดตอบกลับเป็นภาษาไทยเท่านั้น"
    ช่วยคิดข้อมูลสินค้า: "${title}"
    ${task === AiGenTask.TITLE || task === AiGenTask.ALL ? '- ปรับชื่อสินค้าให้ดูน่าสนใจ ดึงดูดลูกค้ามากขึ้น' : ''}
    ${task === AiGenTask.SLUG || task === AiGenTask.ALL ? '- สร้าง slug (kebab-case) จากชื่อสินค้า' : ''}
    ${
      task === AiGenTask.METADATA || task === AiGenTask.ALL
        ? `- สร้าง metadata (array ของ object ที่มี key และ value) โดยใช้ key จาก: ${JSON.stringify(availableKeys)}`
        : ''
    }
    ${task === AiGenTask.TAGS || task === AiGenTask.ALL ? '- สร้าง tags (string คั่นด้วยคอมม่า)' : ''}
    ${task === AiGenTask.ADDONS || task === AiGenTask.ALL ? '- สร้างข้อมูล addons ที่เหมาะสมกับสินค้า' : ''}
    ${
      task === AiGenTask.VARIANTS || task === AiGenTask.ALL
        ? `- สร้างข้อมูลตัวเลือกสินค้า (variants) อย่างน้อย 3 รูปแบบ พร้อมราคา (price) และ SKU ที่เหมาะสม`
        : ''
    }`

    const result = await model.generateContent([prompt, ...imageParts])
    return {
      success: true,
      message: 'ระบบให้ AI คิดเนื้อหาให้คุณสำเร็จแล้ว',
      data: JSON.parse(result.response.text()),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

const mainModel = genAI.getGenerativeModel({ model: GEMINI_MODEL })
async function getPreciseTokenCount(prompt: string) {
  const result = await mainModel.countTokens(prompt)
  return result.totalTokens
}

export async function handleUserPrompt(prompt: string, plan: Plan) {
  const inputTokens = await getPreciseTokenCount(prompt)
  return estimateCost(CreditUsageType.AI, plan, inputTokens, 150)
}
