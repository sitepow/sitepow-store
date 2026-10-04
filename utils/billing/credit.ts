import { CREDIT_TIERS } from '@/constants/credit'

export const getCredits = (amount: number) => {
  const tier =
    CREDIT_TIERS.slice()
      .reverse()
      .find((t) => amount >= t.min) || CREDIT_TIERS[0]
  return Math.floor(amount * tier.rate)
}
