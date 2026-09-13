'use server'

import {
  AFFILIATE_PRODUCT_AI_SCHEMA,
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
import {
  AffiliatePlatform,
  detectAffiliatePlatform,
  parseMarketplaceInput,
} from '@/types/affiliate-product'
import { AiGenTask, CreditUsageType } from '@/types/ai'
import {
  buildAffiliateProductPrompt,
  buildAnalyticsPrompt,
  buildBlogPrompt,
  buildCategoryPrompt,
  buildProductPrompt,
  calculateAiCost,
  estimateCost,
} from '@/utils/ai'
import { BlogFormValues } from '@/zod/blog'
import { CreateCategoryFormValues } from '@/zod/category'
import { ProductFormValues } from '@/zod/product'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

import { prisma } from '@/lib/prisma'

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
        messageTH:
          'โปรดระบุชื่อสินค้าหรืออัปโหลดรูปภาพสินค้าก่อน เพื่อให้ AI ช่วยวิเคราะห์ข้อมูลได้อย่างแม่นยำครับ',
        messageEN:
          'Please provide a product title or upload product images before AI analysis',
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
      messageTH: 'สร้างข้อมูลเรียบร้อย',
      messageEN: 'Data generated successfully',
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
        messageTH:
          'โปรดระบุชื่อหมวดหมู่สินค้าก่อน เพื่อให้ AI ช่วยวิเคราะห์ครับ',
        messageEN: 'Please enter category name first for AI analysis',
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
      messageTH: 'สร้างข้อมูลหมวดหมู่เรียบร้อย',
      messageEN: 'Category data generated successfully',
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
        messageTH: 'โปรดระบุชื่อบทความเบื้องต้น เพื่อให้ AI นำไปประมวลผลครับ',
        messageEN: 'Please enter a preliminary article title for AI processing',
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
      messageTH: 'สร้างเนื้อหาบทความเรียบร้อยแล้ว',
      messageEN: 'Article content generated successfully',
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
        messageTH: 'ไม่พบข้อมูล Analytics สำหรับวิเคราะห์',
        messageEN: 'Analytics data not found for analysis',
        message: 'ไม่พบข้อมูล Analytics สำหรับวิเคราะห์',
      }
    }

    const prompt = buildAnalyticsPrompt(analyticsOverviewData)

    const costEstimate = await handleUserPrompt(prompt, store.plan)
    if (Number(store.balance) < costEstimate.credits) {
      return {
        success: false,
        messageTH: 'เครดิตของคุณไม่เพียงพอสำหรับการวิเคราะห์',
        messageEN: 'Insufficient credits for analysis',
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
      messageTH: 'วิเคราะห์ข้อมูลสำเร็จ',
      messageEN: 'Analysis completed successfully',
      message: 'วิเคราะห์ข้อมูลสำเร็จ',
      data: JSON.parse(responseText),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export interface GenerateAffiliateProductInput {
  url: string
  affiliateUrl?: string
  rawTitle?: string
  rawNotes?: string
  storeId: string
}

export interface GeneratedAffiliateProductData {
  title: string
  slug: string
  description: string
  price: number
  originalPrice: number
  isOnSale: boolean
  discountText?: string
  platform: AffiliatePlatform
  platformLabel?: string
  imageUrl?: string
  images: string[]
  videoUrl?: string
  tags?: string
  metadata?: { key: string; value: string }[]
  affiliateUrl: string
  originalProductUrl: string
}

export interface ScrapedAffiliateProductResult {
  success: boolean
  title?: string
  description?: string
  image?: string
  images: string[]
  videoUrl?: string
  price?: number
  discountText?: string
  finalUrl: string
  platform: AffiliatePlatform
  messageTH?: string
  messageEN?: string
}

export async function scrapeAffiliateProductUrl(
  inputUrl: string,
): Promise<ScrapedAffiliateProductResult> {
  const parsedInput = parseMarketplaceInput(inputUrl)
  const targetUrl = parsedInput.url || inputUrl.trim()
  const platform =
    parsedInput.platform !== 'OTHER'
      ? parsedInput.platform
      : detectAffiliatePlatform(targetUrl)

  let finalUrl = targetUrl
  const images: string[] = []
  let videoUrl: string | undefined

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return {
      success: false,
      images,
      finalUrl,
      platform,
      messageTH: 'กรุณาระบุ URL ที่ขึ้นต้นด้วย http:// หรือ https://',
      messageEN: 'Please provide a valid URL starting with http:// or https://',
    }
  }

  let canonicalUrl = targetUrl

  // Resolve shortlinks (e.g. s.shopee.co.th, shope.ee, s.lazada.co.th, vt.tiktok.com) to get canonical location
  if (
    targetUrl.includes('s.shopee.co.th') ||
    targetUrl.includes('shope.ee') ||
    targetUrl.includes('c.lazada.co.th') ||
    targetUrl.includes('s.lazada.co.th') ||
    targetUrl.includes('vt.tiktok.com')
  ) {
    try {
      const headRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'manual',
      })
      const loc = headRes.headers.get('location')
      if (loc) {
        canonicalUrl = loc
        finalUrl = loc
      }
    } catch {
      // Ignore
    }
  }

  // Social bots are allowed through marketplace anti-bot WAFs (Shopee, TikTok, Lazada)
  const uas = [
    'Twitterbot/1.0',
    'TelegramBot (like TwitterBot)',
    'WhatsApp/2.21.12.21 A',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  ]

  let html = ''
  for (const ua of uas) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 7000)

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': ua,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (response.ok) {
        const text = await response.text()
        if (
          text.length > 500 &&
          (text.includes('og:title') ||
            text.includes('<title') ||
            text.includes('og:image') ||
            text.includes('twitter:title'))
        ) {
          html = text
          finalUrl = response.url || targetUrl
          break
        }
      }
    } catch {
      // Try next user agent
    }
  }

  const cleanText = (str: string): string => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )
      .trim()
  }

  const extractTag = (patterns: RegExp[]): string | undefined => {
    if (!html) return undefined
    for (const pattern of patterns) {
      const match = pattern.exec(html)
      if (match && match[1]) {
        let val = cleanText(match[1])
        val = val
          .replace(/\s*\|\s*Shopee\s*Thailand/gi, '')
          .replace(/\s*\|\s*Shopee/gi, '')
          .replace(/\s*\|\s*Lazada\s*TH/gi, '')
          .replace(/\s*\|\s*Lazada/gi, '')
          .replace(/\s*\|\s*TikTok/gi, '')
          .trim()
        if (
          val &&
          !val.includes('Visit TikTok to discover') &&
          val !== 'Shopee' &&
          val !== 'Lazada'
        ) {
          return val
        }
      }
    }
    return undefined
  }

  const title =
    extractTag([
      /<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i,
      /<meta\s+content=["']([\s\S]*?)["']\s+property=["']og:title["']/i,
      /<meta\s+name=["']twitter:title["']\s+content=["']([\s\S]*?)["']/i,
      /<title>([\s\S]*?)<\/title>/i,
    ]) || parsedInput.title

  const description = extractTag([
    /<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+property=["']og:description["']/i,
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i,
    /<meta\s+name=["']twitter:description["']\s+content=["']([\s\S]*?)["']/i,
  ])

  // Extract primary image
  const ogImage = extractTag([
    /<meta\s+property=["']og:image:secure_url["']\s+content=["']([\s\S]*?)["']/i,
    /<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']/i,
    /<meta\s+content=["']([\s\S]*?)["']\s+property=["']og:image["']/i,
    /<meta\s+name=["']twitter:image["']\s+content=["']([\s\S]*?)["']/i,
  ])

  if (
    ogImage &&
    !ogImage.includes('logo') &&
    !ogImage.includes('poster-square')
  ) {
    images.push(ogImage)
  }

  if (html) {
    // For Shopee: resolve shopId and itemId to fetch full product PDP and get ALL gallery images
    const shopeeIdMatch = (
      canonicalUrl +
      ' ' +
      finalUrl +
      ' ' +
      targetUrl +
      ' ' +
      html
    ).match(/(?:product|opaanlp|i\.)\/(\d+)\/(\d+)/)
    if (shopeeIdMatch) {
      const [, sId, iId] = shopeeIdMatch
      try {
        const pdpRes = await fetch(
          `https://shopee.co.th/product/${sId}/${iId}`,
          {
            headers: {
              'User-Agent': 'Twitterbot/1.0',
            },
          },
        )
        if (pdpRes.ok) {
          const pdpHtml = await pdpRes.text()
          const pdpImgMatches =
            pdpHtml.match(
              /https:\/\/(?:down-th|down-ws|down-sg|cf)\.img\.susercontent\.com\/file\/[a-zA-Z0-9_-]+/g,
            ) || []
          for (const img of pdpImgMatches) {
            const clean = img.replace(/_tn$/, '').replace(/_cover$/, '')
            if (
              !images.includes(clean) &&
              !clean.includes('logo') &&
              !clean.includes('poster-square') &&
              images.length < 15
            ) {
              images.push(clean)
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    // Extract Shopee CDN images from current HTML
    const shopeeImgRegex =
      /(?:https?:)?\/\/(?:down-th|down-ws|down-sg|cf)\.img\.susercontent\.com\/file\/[a-zA-Z0-9_-]+/g
    let sMatch
    while (
      (sMatch = shopeeImgRegex.exec(html)) !== null &&
      images.length < 15
    ) {
      const fullUrl = sMatch[0].startsWith('http')
        ? sMatch[0].replace(/_tn$/, '')
        : `https:${sMatch[0].replace(/_tn$/, '')}`
      if (
        !images.includes(fullUrl) &&
        !fullUrl.includes('logo') &&
        !fullUrl.includes('poster-square')
      ) {
        images.push(fullUrl)
      }
    }

    // Extract Lazada CDN images
    const lazadaImgRegex =
      /https?:\/\/(?:[a-zA-Z0-9_-]+\.alicdn\.com|[^"'\s>]+\.slatic\.net)\/p\/[a-zA-Z0-9_-]+/g
    let lMatch
    while (
      (lMatch = lazadaImgRegex.exec(html)) !== null &&
      images.length < 15
    ) {
      if (!images.includes(lMatch[0])) {
        images.push(lMatch[0])
      }
    }

    // Extract TikTok CDN images
    const tiktokImgRegex =
      /https?:\/\/(?:[a-zA-Z0-9_-]+\.tiktokcdn\.com|p16-va\.tiktokcdn\.com)\/[^"'\s>]+/g
    let tMatch
    while (
      (tMatch = tiktokImgRegex.exec(html)) !== null &&
      images.length < 15
    ) {
      if (!images.includes(tMatch[0])) {
        images.push(tMatch[0])
      }
    }

    // Extract standard images from HTML
    const imgRegex =
      /<img\s+[^>]*?(?:src|data-src)=["'](https?:\/\/[^"'\s>]+?\.(?:jpg|jpeg|png|webp)[^"'\s>]*)["']/gi
    let imgMatch
    while ((imgMatch = imgRegex.exec(html)) !== null && images.length < 8) {
      const src = imgMatch[1]
      if (
        src &&
        !images.includes(src) &&
        !src.includes('logo') &&
        !src.includes('icon') &&
        !src.includes('avatar') &&
        !src.includes('badge') &&
        !src.includes('tracker')
      ) {
        images.push(src)
      }
    }

    // Extract video
    const videoTag = extractTag([
      /<meta\s+property=["']og:video:secure_url["']\s+content=["']([\s\S]*?)["']/i,
      /<meta\s+property=["']og:video:url["']\s+content=["']([\s\S]*?)["']/i,
      /<meta\s+property=["']og:video["']\s+content=["']([\s\S]*?)["']/i,
      /<meta\s+content=["']([\s\S]*?)["']\s+property=["']og:video["']/i,
      /<video\s+[^>]*?src=["'](https?:\/\/[^"'\s>]+)["']/i,
    ])
    if (videoTag) {
      videoUrl = videoTag
    } else if (
      finalUrl.includes('tiktok.com') ||
      targetUrl.includes('tiktok.com')
    ) {
      const tiktokVideoMatch = (finalUrl + targetUrl).match(/video\/(\d+)/)
      if (tiktokVideoMatch && tiktokVideoMatch[1]) {
        videoUrl = `https://www.tiktok.com/embed/v2/${tiktokVideoMatch[1]}`
      }
    }
  }

  let price: number | undefined = parsedInput.price
  if (!price && html) {
    const priceStr = extractTag([
      /<meta\s+property=["']product:price:amount["']\s+content=["']([\s\S]*?)["']/i,
      /<meta\s+property=["']og:price:amount["']\s+content=["']([\s\S]*?)["']/i,
      /"price":\s*"*([0-9.]+)"*/i,
      /"lowPrice":\s*"*([0-9.]+)"*/i,
    ])
    if (priceStr) {
      const parsed = parseFloat(priceStr)
      if (!isNaN(parsed) && parsed > 0) {
        price = parsed
      }
    }
  }

  return {
    success: !!(title || images.length > 0 || description),
    title,
    description,
    image: images[0] || ogImage,
    images,
    videoUrl,
    price,
    discountText: parsedInput.discountText,
    finalUrl,
    platform,
  }
}

function cleanAffiliateTextWithoutEmojis(text: string): string {
  if (!text) return ''
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\uFE0E\uFE0F\u200D]/g, '')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      if (/^[•*▪▫►–—]\s*/.test(trimmed)) {
        return trimmed.replace(/^[•*▪▫►–—]\s*/, '- ')
      }
      return trimmed
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function generateAffiliateProductAi(
  input: GenerateAffiliateProductInput,
): Promise<{
  success: boolean
  messageTH?: string
  messageEN?: string
  message?: string
  data?: GeneratedAffiliateProductData
}> {
  try {
    const { url, affiliateUrl, rawTitle, rawNotes, storeId } = input

    // Auto-parse input if user pasted combined share message or URL with text
    const parsedInput = parseMarketplaceInput(url)
    const cleanUrl = parsedInput.url || url.trim()
    const effectiveTitle = rawTitle?.trim() || parsedInput.title
    const effectivePrice = parsedInput.price
    const effectiveDiscount = parsedInput.discountText

    if (!cleanUrl || !cleanUrl.startsWith('http')) {
      return {
        success: false,
        messageTH:
          'กรุณาระบุลิงก์สินค้าที่ถูกต้อง (เริ่มต้นด้วย http:// หรือ https://)',
        messageEN:
          'Please provide a valid product URL (starting with http:// or https://)',
        message: 'กรุณาระบุลิงก์สินค้าที่ถูกต้อง',
      }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { balance: true, plan: true },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลร้านค้า',
        messageEN: 'Store not found',
        message: 'ไม่พบข้อมูลร้านค้า',
      }
    }

    const detectedPlatform =
      parsedInput.platform !== 'OTHER'
        ? parsedInput.platform
        : detectAffiliatePlatform(cleanUrl)

    const scraped = await scrapeAffiliateProductUrl(cleanUrl)

    const prompt = buildAffiliateProductPrompt({
      url: scraped.finalUrl || cleanUrl,
      platform: detectedPlatform,
      rawTitle: effectiveTitle,
      scrapedTitle: scraped.title,
      scrapedDescription: scraped.description,
      scrapedPrice: effectivePrice || scraped.price,
      scrapedImage: scraped.image,
      scrapedImages: scraped.images,
      scrapedVideo: scraped.videoUrl,
      rawNotes: rawNotes?.trim(),
    })

    const costEstimate = await handleUserPrompt(prompt, store.plan)
    if (Number(store.balance) < costEstimate.credits) {
      return {
        success: false,
        messageTH: 'เครดิตของคุณไม่เพียงพอสำหรับการสร้างข้อมูลด้วย AI',
        messageEN: 'Insufficient credits for AI generation',
        message: 'เครดิตของคุณไม่เพียงพอสำหรับการสร้างข้อมูลด้วย AI',
      }
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction:
        'คุณคือนักเขียนข้อมูลสินค้าและการตลาดออนไลน์ระดับมืออาชีพ เขียนรายละเอียดสินค้าที่มีการจัดย่อหน้า เว้นบรรทัดให้อ่านง่าย สบายตา ห้ามใส่อีโมจิ (No Emojis) ใดๆ ทั้งสิ้น และหากมีรายการลิสต์ (List) ให้ใช้เครื่องหมายขีด (-) นำหน้าเท่านั้น',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: AFFILIATE_PRODUCT_AI_SCHEMA,
      },
    })

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const parsed = JSON.parse(responseText)

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
          description: `AI สร้างสินค้า Affiliate (${detectedPlatform}) (Tokens: ${inputTokens}+${outputTokens})`,
        },
      }),
    ])

    const destinationAffiliateUrl =
      affiliateUrl && affiliateUrl.trim().length > 0
        ? affiliateUrl.trim()
        : cleanUrl

    const rawPrice =
      effectivePrice || Number(parsed.price) || scraped.price || 0
    const rawOriginalPrice =
      Number(parsed.originalPrice) ||
      (parsed.isOnSale && rawPrice > 0 ? Math.round(rawPrice * 1.25) : rawPrice)

    const cleanPlatform =
      (parsed.platform?.toUpperCase() as AffiliatePlatform) || detectedPlatform

    const allImages = Array.from(
      new Set(
        [
          parsed.imageUrl,
          ...(Array.isArray(parsed.images) ? parsed.images : []),
          ...(scraped.images || []),
        ].filter(
          (img): img is string => typeof img === 'string' && Boolean(img),
        ),
      ),
    )

    const rawTitleResult =
      parsed.title || effectiveTitle || scraped.title || 'สินค้าแนะนำ'
    const rawDescription = parsed.description || scraped.description || ''

    const data: GeneratedAffiliateProductData = {
      title: cleanAffiliateTextWithoutEmojis(rawTitleResult),
      slug:
        parsed.slug ||
        `aff-${detectedPlatform.toLowerCase()}-${Date.now().toString(36)}`,
      description: cleanAffiliateTextWithoutEmojis(rawDescription),
      price: rawPrice,
      originalPrice: rawOriginalPrice >= rawPrice ? rawOriginalPrice : rawPrice,
      isOnSale: Boolean(
        parsed.isOnSale || rawOriginalPrice > rawPrice || effectiveDiscount,
      ),
      discountText:
        parsed.discountText ||
        effectiveDiscount ||
        (rawOriginalPrice > rawPrice ? 'ลดพิเศษ' : undefined),
      platform: cleanPlatform,
      platformLabel: parsed.platformLabel || undefined,
      imageUrl: allImages[0] || '',
      images: allImages,
      videoUrl: parsed.videoUrl || scraped.videoUrl || undefined,
      tags: cleanAffiliateTextWithoutEmojis(parsed.tags || ''),
      metadata: Array.isArray(parsed.metadata)
        ? parsed.metadata.map((item: any) => ({
            key: cleanAffiliateTextWithoutEmojis(item.key || ''),
            value: cleanAffiliateTextWithoutEmojis(item.value || ''),
          }))
        : [],
      affiliateUrl: destinationAffiliateUrl,
      originalProductUrl: cleanUrl,
    }

    return {
      success: true,
      messageTH: 'วิเคราะห์และสร้างข้อมูลสินค้าสำเร็จ',
      messageEN: 'Product generated successfully from affiliate link',
      message: 'วิเคราะห์และสร้างข้อมูลสินค้าสำเร็จ',
      data,
    }
  } catch (error) {
    console.error('generateAffiliateProductAi error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการประมวลผลด้วย AI โปรดลองใหม่อีกครั้ง',
      messageEN: 'Failed to generate product via AI, please try again',
      message: 'เกิดข้อผิดพลาดในการประมวลผลด้วย AI',
    }
  }
}
