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
