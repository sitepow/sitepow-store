import { PLAN_DETAILS } from '@/config/planDetails'
import {
  AI_MARGIN_MULTIPLIER,
  BASE_CREDIT_VALUE_THB,
  GEMINI_MODEL,
  GEMINI_PRICING_USD_PER_1M,
  SLIP_CREDIT_COST,
  TOKENS_PER_UNIT,
  USD_TO_THB_RATE,
} from '@/constants/ai'
import { Plan } from '@/generated/prisma/enums'
import { CreditUsageType } from '@/types/ai'

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
