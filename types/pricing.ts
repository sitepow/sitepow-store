import { ReactNode } from 'react'

export interface PricingOption {
  value: string
  label: string
  discountPercent?: number
}

export interface FeatureItem {
  text: ReactNode
  icon?: ReactNode
}

export interface PricingPlanProps {
  seed?: string
  title: string
  description: string
  price: string
  currency: string
  uniqueFeatures?: FeatureItem[]
  buttonText: string
  isPopular?: boolean
}

export interface PricingFeature {
  label: string
  access: boolean[]
}

export interface PricingCategory {
  name: string
  features: PricingFeature[]
}

export interface PricingTables {
  tiers: string[]
  categories: PricingCategory[]
}
