'use server'

import {
  GEMINI_MODEL,
  PRODUCT_SCHEMA,
  PRODUCT_SCHEMA_PARTS,
} from '@/constants/ai'
import { PLAN_DETAILS } from '@/constants/plan'
import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { Plan, TransactionType } from '@/generated/prisma/enums'
import { AiGenTask, CreditUsageType } from '@/types/ai'
import { calculateAiCost, estimateCost } from '@/utils/ai'
import { ProductFormValues } from '@/zod/product'
import { GoogleGenerativeAI } from '@google/generative-ai'

import { prisma } from '@/lib/prisma'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateProductAiAction(
  currentData: Partial<ProductFormValues>,
  task: AiGenTask,
  storeId: string,
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { balance: true, plan: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบร้านค้า' }
    }

    const { title, images } = currentData
    const hasTitle = title && title.trim().length > 0
    const hasImages = images && images.length > 0

    if (!hasTitle && !hasImages) {
      return {
        success: false,
        message:
          'โปรดระบุชื่อสินค้าหรืออัปโหลดรูปภาพสินค้าก่อน เพื่อให้ AI ช่วยวิเคราะห์ข้อมูลได้อย่างแม่นยำครับ',
      }
    }

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

    const prompt = `คุณคือผู้เชี่ยวชาญด้านการตลาด "โปรดตอบกลับเป็นภาษาไทยเท่านั้น"
    ช่วยคิดข้อมูลสินค้า: "${title}"
    ${task === AiGenTask.TITLE || task === AiGenTask.ALL ? '- ปรับชื่อสินค้าให้ดูน่าสนใจ' : ''}
    ${task === AiGenTask.SLUG || task === AiGenTask.ALL ? '- สร้าง slug (kebab-case)' : ''}
    ${task === AiGenTask.METADATA || task === AiGenTask.ALL ? `- สร้าง metadata จาก key: ${JSON.stringify(PRODUCT_METADATA_MASTER.flatMap((g) => g.fields).map((f) => f.key))}` : ''}
    ${task === AiGenTask.TAGS || task === AiGenTask.ALL ? '- สร้าง tags (string คั่นด้วยคอมม่า)' : ''}
    ${task === AiGenTask.ADDONS || task === AiGenTask.ALL ? '- สร้างข้อมูล addons' : ''}
    ${task === AiGenTask.VARIANTS || task === AiGenTask.ALL ? '- สร้าง variants พร้อมราคาและ SKU' : ''}`

    const costEstimate = await handleUserPrompt(prompt, store.plan)
    if (Number(store.balance) < costEstimate.credits) {
      return { success: false, message: 'เครดิตของคุณไม่เพียงพอ' }
    }

    const responseSchema =
      task === AiGenTask.ALL ? PRODUCT_SCHEMA : PRODUCT_SCHEMA_PARTS[task]
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    })

    const result = await model.generateContent([prompt, ...imageParts])
    const responseText = result.response.text()

    const usage = result.response.usageMetadata
    const inputTokens = usage?.promptTokenCount || 0
    const outputTokens = usage?.candidatesTokenCount || 0

    const actualCost = calculateAiCost(
      GEMINI_MODEL,
      inputTokens,
      outputTokens,
      PLAN_DETAILS[store.plan].aiUsageMultiplier,
    )

    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { balance: { decrement: actualCost } },
      }),
      prisma.transaction.create({
        data: {
          storeId,
          amount: actualCost,
          type: TransactionType.AI_USAGE,
          description: `AI คิดเนื้อหาสินค้า สำหรับงาน ${task} (Tokens: ${inputTokens}+${outputTokens})`,
        },
      }),
    ])

    return {
      success: true,
      message: 'สร้างข้อมูลเรียบร้อย',
      data: JSON.parse(responseText),
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
