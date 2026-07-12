import {
  AI_MARGIN_MULTIPLIER,
  BASE_CREDIT_VALUE_THB,
  GEMINI_PRICING_USD_PER_1M,
  TOKENS_PER_UNIT,
  USD_TO_THB_RATE,
} from '@/constants/ai'

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
