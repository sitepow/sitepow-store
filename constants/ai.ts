export const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview'

export const GEMINI_PRICING_USD_PER_1M: Record<
  string,
  { input: number; output: number }
> = {
  [GEMINI_MODEL]: { input: 0.25, output: 1.5 },
}

export const AI_MARGIN_MULTIPLIER = 1.5
export const USD_TO_THB_RATE = 33.29
export const TOKENS_PER_UNIT = 1_000_000
export const BASE_CREDIT_VALUE_THB = 0.75
