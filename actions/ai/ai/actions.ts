'use server'

import {
  ANALYTICS_INSIGHTS_SCHEMA,
  BLOG_SCHEMA,
  BLOG_SCHEMA_PARTS,
  CATEGORY_SCHEMA,
  GEMINI_MODEL,
  PRODUCT_SCHEMA,
  PRODUCT_SCHEMA_PARTS,
} from '@/constants/ai'
import { PLAN_DETAILS } from '@/constants/plan'
import { Plan, TransactionType } from '@/generated/prisma/enums'
import { AiGenTask, CreditUsageType } from '@/types/ai'
import {
  buildAnalyticsPrompt,
  buildBlogPrompt,
  buildCategoryPrompt,
  buildProductPrompt,
  calculateAiCost,
  estimateCost,
} from '@/utils/ai/ai-helpers'
import { BlogFormValues } from '@/zod/catalog/blog'
import { CreateCategoryFormValues } from '@/zod/catalog/category'
import { ProductFormValues } from '@/zod/catalog/product'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

import { prisma } from '@/lib/db/prisma'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const mainModel = genAI.getGenerativeModel({ model: GEMINI_MODEL })
async function getPreciseTokenCount(prompt: string) {
  const result = await mainModel.countTokens(prompt)
  return result.totalTokens
}

export async function handleUserPrompt(prompt: string, plan: Plan) {
  const inputTokens = await getPreciseTokenCount(prompt)
  return estimateCost(CreditUsageType.AI, plan, inputTokens, 150)
}

export async function generateProductAi(
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

    const prompt = buildProductPrompt(task, title!)

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

export async function generateCategoryAi(
  currentData: Partial<CreateCategoryFormValues>,
  storeId: string,
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { balance: true, plan: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    const { title, description } = currentData

    if (!title || title.trim().length === 0) {
      return {
        success: false,
        message: 'โปรดระบุชื่อหมวดหมู่สินค้าก่อน เพื่อให้ AI ช่วยวิเคราะห์ครับ',
      }
    }

    const prompt = buildCategoryPrompt(title, description)

    const costEstimate = await handleUserPrompt(prompt, store.plan)
    if (Number(store.balance) < costEstimate.credits) {
      return { success: false, message: 'เครดิตของคุณไม่เพียงพอ' }
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: CATEGORY_SCHEMA,
      },
    })

    const result = await model.generateContent(prompt)
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
          description: `AI คิดข้อมูลหมวดหมู่สินค้า (${title}) (Tokens: ${inputTokens}+${outputTokens})`,
        },
      }),
    ])

    return {
      success: true,
      message: 'สร้างข้อมูลหมวดหมู่เรียบร้อย',
      data: JSON.parse(responseText) as {
        title: string
        slug: string
        description?: string
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function generateBlogAi(
  currentData: Partial<BlogFormValues>,
  task: AiGenTask,
  storeId: string,
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { balance: true, plan: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    const { title, content } = currentData

    if (task !== AiGenTask.ALL && !title?.trim()) {
      return {
        success: false,
        message: 'โปรดระบุชื่อบทความเบื้องต้น เพื่อให้ AI นำไปประมวลผลครับ',
      }
    }

    const prompt = buildBlogPrompt(task, title, content)

    const costEstimate = await handleUserPrompt(prompt, store.plan)
    if (Number(store.balance) < costEstimate.credits) {
      return { success: false, message: 'เครดิตของคุณไม่เพียงพอ' }
    }

    const responseSchema =
      task === AiGenTask.ALL ? BLOG_SCHEMA : BLOG_SCHEMA_PARTS[task]

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    })

    const result = await model.generateContent(prompt)
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
          description: `AI ช่วยเขียนบทความสำหรับงาน ${task} (Tokens: ${inputTokens}+${outputTokens})`,
        },
      }),
    ])

    return {
      success: true,
      message: 'สร้างเนื้อหาบทความเรียบร้อยแล้ว',
      data: JSON.parse(responseText) as Partial<BlogFormValues>,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function generateAnalyticsInsightsAi(
  analyticsOverviewData: any,
  storeId: string,
) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { balance: true, plan: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    if (!analyticsOverviewData) {
      return {
        success: false,
        message: 'ไม่พบข้อมูล Analytics สำหรับวิเคราะห์',
      }
    }

    const prompt = buildAnalyticsPrompt(analyticsOverviewData)

    const costEstimate = await handleUserPrompt(prompt, store.plan)
    if (Number(store.balance) < costEstimate.credits) {
      return {
        success: false,
        message: 'เครดิตของคุณไม่เพียงพอสำหรับการวิเคราะห์',
      }
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ANALYTICS_INSIGHTS_SCHEMA as any,
      },
    })

    const result = await model.generateContent(prompt)
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
          description: `AI วิเคราะห์ข้อมูลสรุปเชิงกลยุทธ์ร้านค้า (Tokens: ${inputTokens}+${outputTokens})`,
        },
      }),
    ])

    return {
      success: true,
      message: 'วิเคราะห์ข้อมูลสำเร็จ',
      data: JSON.parse(responseText),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
