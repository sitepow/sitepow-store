import {
  AI_MARGIN_MULTIPLIER,
  BASE_CREDIT_VALUE_THB,
  GEMINI_MODEL,
  GEMINI_PRICING_USD_PER_1M,
  SLIP_CREDIT_COST,
  TOKENS_PER_UNIT,
  USD_TO_THB_RATE,
} from '@/constants/ai'
import { PLAN_DETAILS } from '@/constants/plan'
import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { Plan } from '@/generated/prisma/enums'
import { AiGenTask, CreditUsageType } from '@/types/ai'

export function calculateAiCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  planMultiplier: number,
): number {
  const pricing = GEMINI_PRICING_USD_PER_1M[model]

  if (!pricing) {
    return 0
  }

  const inputCostUsd = (inputTokens / TOKENS_PER_UNIT) * pricing.input
  const outputCostUsd = (outputTokens / TOKENS_PER_UNIT) * pricing.output
  const rawCostBaht = (inputCostUsd + outputCostUsd) * USD_TO_THB_RATE
  const totalChargeBaht = rawCostBaht * AI_MARGIN_MULTIPLIER * planMultiplier
  const creditsToDeduct = totalChargeBaht / BASE_CREDIT_VALUE_THB
  return Number(creditsToDeduct.toFixed(2))
}

export function estimateCost(
  type: CreditUsageType,
  plan: Plan,
  inputTokens: number = 0,
  outputTokens: number = 0,
): { credits: number; baht: number } {
  if (type === CreditUsageType.SLIP) {
    const credits = SLIP_CREDIT_COST[plan]
    return { credits, baht: credits * BASE_CREDIT_VALUE_THB }
  }

  const pricing = GEMINI_PRICING_USD_PER_1M[GEMINI_MODEL]
  const planMultiplier = PLAN_DETAILS[plan].aiUsageMultiplier

  const inputCostUsd = (inputTokens / TOKENS_PER_UNIT) * pricing.input
  const outputCostUsd = (outputTokens / TOKENS_PER_UNIT) * pricing.output

  const totalChargeBaht =
    (inputCostUsd + outputCostUsd) *
    USD_TO_THB_RATE *
    AI_MARGIN_MULTIPLIER *
    planMultiplier
  const credits = totalChargeBaht / BASE_CREDIT_VALUE_THB

  return {
    credits: Number(credits.toFixed(2)),
    baht: Number(totalChargeBaht.toFixed(2)),
  }
}

export const buildProductPrompt = (task: AiGenTask, title: string) => {
  return `คุณคือผู้เชี่ยวชาญด้านการตลาด "โปรดตอบกลับเป็นภาษาไทยเท่านั้น"
    ช่วยคิดข้อมูลสินค้า: "${title}"
    ${task === AiGenTask.TITLE || task === AiGenTask.ALL ? '- ปรับชื่อสินค้าให้ดูน่าสนใจ' : ''}
    ${task === AiGenTask.SLUG || task === AiGenTask.ALL ? '- สร้าง slug (kebab-case)' : ''}
    ${task === AiGenTask.METADATA || task === AiGenTask.ALL ? `- สร้าง metadata จาก key: ${JSON.stringify(PRODUCT_METADATA_MASTER.flatMap((g) => g.fields).map((f) => f.key))}` : ''}
    ${task === AiGenTask.TAGS || task === AiGenTask.ALL ? '- สร้าง tags (string คั่นด้วยคอมม่า)' : ''}
    ${task === AiGenTask.ADDONS || task === AiGenTask.ALL ? '- สร้างข้อมูล addons' : ''}
    ${task === AiGenTask.VARIANTS || task === AiGenTask.ALL ? '- สร้าง variants พร้อมราคาและ SKU' : ''}`
}

export function buildCategoryPrompt(title: string, description?: string) {
  return `คุณคือผู้เชี่ยวชาญด้าน SEO และ eCommerce "โปรดตอบกลับเป็นภาษาไทยเท่านั้น"
ช่วยคิดข้อมูลหมวดหมู่สินค้า:
- ชื่อหมวดหมู่เดิม: "${title}"
${description ? `- คำอธิบายเพิ่มเติม: "${description}"` : ''}

สิ่งที่ต้องการ:
1. ปรับปรุงชื่อหมวดหมู่ (title): ให้ดูดี ตรงประเด็น สั้น กระชับสำหรับเป็นชื่อหมวดหมู่สินค้าในเว็บไซต์ (ห้ามยาวเกิน 3-5 คำ หรือไม่เกิน 30 ตัวอักษร ไม่เอาชื่อยาวแบบชื่อบทความ)
2. สร้าง URL slug ภาษาอังกฤษแบบ kebab-case ที่สั้น กุมความหมาย และถูกต้องตามหลัก SEO
3. สร้างคำอธิบายหมวดหมู่สินค้า (Description) สั้นๆ กระชับ 1-2 ประโยค ส่งเสริม SEO`
}

export const buildBlogPrompt = (
  task: AiGenTask,
  title?: string,
  currentContent?: string,
) => {
  return `คุณคือผู้เชี่ยวชาญด้าน Copywriter, SEO Content Creator และการตลาดออนไลน์ "โปรดตอบกลับเป็นภาษาไทยเท่านั้น"
    
    ข้อมูลเบื้องต้น:
    - หัวข้อ/คำค้นหาหลัก: "${title || 'บทความทั่วไป'}"
    ${currentContent ? `- ร่างเนื้อหาเบื้องต้น: "${currentContent.slice(0, 300)}..."` : ''}

    สิ่งที่ต้องการทำ (${task}):
    ${task === AiGenTask.TITLE ? '- คิดชื่อบทความที่น่าสนใจ ดึงดูดให้คนคลิกอ่าน (Click-worthy) และตรงตามหลัก SEO' : ''}
    ${task === AiGenTask.SLUG ? '- สร้าง URL slug ภาษาอังกฤษแบบ kebab-case ที่สั้น กระชับ กุมความหมาย' : ''}
    ${task === AiGenTask.TAGS ? '- สร้างแท็ก (Tags) ที่เกี่ยวข้อง 3-5 คำ คั่นด้วยเครื่องหมายจุลภาค (,)' : ''}
    ${
      task === AiGenTask.ALL
        ? `- เขียนบทความฉบับเต็มในรูปแบบ Markdown ที่มีการจัดโครงสร้างสวยงาม (ใช้ #, ##, Bullet points, Bolding)
- คิดชื่อบทความ (title)
- คิด URL slug (kebab-case)
- คิดแท็กบทความ (tags คั่นด้วยคอมม่า)`
        : ''
    }`
}

export function buildAnalyticsPrompt(analyticsData: any) {
  return `
คุณคือผู้เชี่ยวชาญด้านกลยุทธ์การขายและการวิเคราะห์ข้อมูลร้านค้า (Retail & E-commerce Data Analyst) 
โปรดวิเคราะห์ข้อมูลสถิติของร้านค้าฉบับนี้ แล้วสรุปคำแนะนำเชิงกลยุทธ์ที่ร้านค้าสามารถนำไปปฏิบัติตามได้ทันที (Actionable Insights)

[ข้อมูลสถิติมุมมองร้านค้า]:
${JSON.stringify(analyticsData, null, 2)}

[โจทย์ที่ต้องตอบและวิเคราะห์]:
1. สรุปภาพรวมธุรกิจสั้นๆ ให้เจ้าของร้านเข้าใจง่าย
2. ควรเริ่มเปิดขายกี่โมง? วิเคราะห์จาก Heatmap และ Peak Hours เพื่อจัดกำลังคน/สต็อกสินค้า
3. สินค้าไหนควรเน้นขาย? และคู่สินค้าไหนควรถือโอกาสทำโปรโมชั่นจัดเซ็ต (Bundle Promotion) หรือ Upsell
4. กลยุทธ์การดึงดูดลูกค้าซ้ำ (Retention) จากตัวเลข Repeat Purchase Rate
5. ข้อเสนอแนะเชิงรุก 3-4 ข้อที่ร้านค้าต้องลงมือทำทันที
`
}

export function buildAffiliateProductPrompt(input: {
  url: string
  platform: string
  rawTitle?: string
  scrapedTitle?: string
  scrapedDescription?: string
  scrapedPrice?: number
  scrapedImage?: string
  scrapedImages?: string[]
  scrapedVideo?: string
  rawNotes?: string
}) {
  const targetProductTitle = input.rawTitle || input.scrapedTitle

  return `คุณคือผู้เชี่ยวชาญด้าน Copywriting และการตลาดออนไลน์สำหรับสินค้า Affiliate (Shopee, Lazada, TikTok Shop) "โปรดตอบกลับเป็นภาษาไทยเท่านั้น"

เป้าหมายของคุณ:
แปลงข้อมูลสินค้าจากลิงก์มาร์เก็ตเพลส (${input.platform}) ให้กลายเป็น "หน้าสินค้าที่มีเสน่ห์ น่าซื้อ น่าเชื่อถือ และเขียนเรียบเรียงใหม่ทั้งหมด" โดยไม่ใช้คำสแปมจากมาร์เก็ตเพลส

${
  targetProductTitle
    ? `[สำคัญที่สุด - สินค้าเป้าหมาย]:
คุณต้องเขียนข้อมูลสินค้าสำหรับ: "${targetProductTitle}" เท่านั้น!
ห้ามเปลี่ยนเป็นสินค้าชนิดอื่น หรือสุ่มสินค้าที่ไม่เกี่ยวข้องเด็ดขาด`
    : ''
}

กฎเหล็กสำคัญที่สุด (CRITICAL COPYWRITING RULES):
1. [ชื่อสินค้า]: ห้ามก็อปปี้ชื่อสินค้าแบบมาร์เก็ตเพลสเดิมๆ เช่น "ส่งฟรี แท้ 100% ด่วน เก็บเงินปลายทาง ประกันศูนย์ 1 ปี"
   - ต้องเขียนใหม่ให้เป็นชื่อสินค้าที่กระชับ พรีเมียม ตรงไปตรงมา และมีจุดเด่นหลัก (เช่น "ลำโพงบลูทูธพกพา ดีไซน์เรโทร เบสแน่น กันน้ำ IPX5")
2. [URL Slug]: สร้าง slug ภาษาอังกฤษแบบ kebab-case ที่สั้น ตรงตามคีย์เวิร์ด เช่น "retro-portable-bluetooth-speaker"
3. [รายละเอียดสินค้า (Description)]: จัดโครงสร้างและเขียนรายละเอียดสินค้าตามปกติ:
   - เว้นบรรทัด ขึ้นบรรทัดใหม่ แยกย่อหน้าและหัวข้อให้อ่านง่าย สบายตา
   - ห้ามใส่อีโมจิใดๆ ทั้งสิ้นในข้อความ (ห้ามใช้ Emoji เด็ดขาด)
   - หากมีรายการ หรือ List ข้อย่อย (Bullet points) ให้ใช้เครื่องหมายขีดกลาง "- " นำหน้าเท่านั้น
   - เขียนสรุปความน่าสนใจ จุดเด่น สเปกการใช้งาน และบริการรับประกันให้ครบถ้วน น่าซื้อ
4. [ราคาและส่วนลด]:
   - กำหนด price (ราคาขาย) และ originalPrice (ราคาตั้ง/ราคาเต็ม)
   - หากตรวจพบว่ามีส่วนลด ให้ตั้ง isOnSale: true และระบุ discountText เช่น "ลด 30%", "Flash Sale", "คุ้มค่าที่สุด"
5. [Tags]: คำค้นหาที่ตรงกับสินค้า 4-6 แท็ก คั่นด้วยเครื่องหมายจุลภาค
6. [Metadata]: สกัดคุณสมบัติที่สำคัญอย่างน้อย 3-5 รายการ (เช่น แบรนด์, วัสดุ, การเชื่อมต่อ, ขนาด, สี, การรับประกัน)

ข้อมูลสินค้า:
- แพลตฟอร์ม: ${input.platform}
- URL สินค้า: ${input.url}
${targetProductTitle ? `- ชื่อสินค้า: "${targetProductTitle}"` : ''}
${input.scrapedDescription ? `- ข้อมูลสรุปที่ตรวจพบ: "${input.scrapedDescription.slice(0, 1000)}"` : ''}
${input.scrapedPrice ? `- ราคาที่ตรวจพบ: ${input.scrapedPrice} บาท` : ''}
${input.scrapedImage ? `- ลิงก์รูปภาพหลัก: ${input.scrapedImage}` : ''}
${input.scrapedImages && input.scrapedImages.length > 0 ? `- ลิงก์รูปภาพทั้งหมด: ${JSON.stringify(input.scrapedImages.slice(0, 8))}` : ''}
${input.scrapedVideo ? `- ลิงก์วิดีโอ: ${input.scrapedVideo}` : ''}
${input.rawNotes ? `- ข้อความเน้นย้ำเพิ่มเติมจากเจ้าของร้าน: "${input.rawNotes}"` : ''}

กรุณาส่งกลับเป็น JSON ที่ตรงตามโครงสร้าง Schema ที่กำหนดอย่างเคร่งครัด`
}
