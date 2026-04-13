import { ReactNode } from 'react'

export interface PricingOption {
  value: string
  label: string
  discount?: string
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
  features: FeatureItem[]
  buttonText: string
  isPopular?: boolean
}
