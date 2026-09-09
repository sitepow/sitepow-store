import React from 'react'

import thFeatures from '@/i18n/locales/th/features.json'
import {
  IconBox,
  IconBuildingStore,
  IconChartBar,
  IconClipboardList,
  IconCreditCard,
  IconDatabaseImport,
  IconDeviceLaptop,
  IconPercentage,
  IconSparkles,
  IconTicket,
  IconTruckDelivery,
  IconUsers,
} from '@tabler/icons-react'

export interface FeatureCapability {
  title: string
  description: string
  badge?: string
}

export interface FeatureFaq {
  q: string
  a: string
}

export interface FeatureMetric {
  value: string
  label: string
  desc: string
}

export interface FeatureWorkflowStep {
  step: string
  title: string
  description: string
}

export interface FeatureComparison {
  traditional: {
    title: string
    points: string[]
  }
  sitepow: {
    title: string
    points: string[]
  }
}

export interface FeatureItem {
  slug: string
  title: string
  tagline: string
  category: 'pos' | 'ai' | 'inventory' | 'sales' | 'marketing'
  categoryLabel: string
  icon: React.ReactNode
  image?: string
  shortDescription: string
  fullDescription: string
  highlights: string[]
  metrics: FeatureMetric[]
  workflow: FeatureWorkflowStep[]
  comparison: FeatureComparison
  capabilities: FeatureCapability[]
  faqs: FeatureFaq[]
}

export interface FeatureMeta {
  slug: string
  category: 'pos' | 'ai' | 'inventory' | 'sales' | 'marketing'
  icon: React.ReactNode
  image?: string
}

export const FEATURE_IMAGES: Record<string, string> = {
  ai: '/images/landing/landing-ai-slip.jpeg',
  'zero-gp': '/images/landing/landing-pricing.jpeg',
  inventory: '/images/landing/landing-inventory.jpeg',
  pos: '/images/landing/landing-pos.jpeg',
  'online-store': '/images/landing/landing-customization.jpeg',
  orders: '/images/landing/landing-orders-managers.jpeg',
  analytics: '/images/hero-section/section-3.jpeg',
  payment: '/images/landing/landing-payments.jpeg',
  crm: '/images/landing/landing-loyalty.jpeg',
  promotions: '/images/landing/landing-reseller.jpeg',
  'import-export': '/images/landing/landing-cloud.jpeg',
  logistics: '/images/landing/landing-security.jpeg',
}

export const FEATURE_METAS: FeatureMeta[] = [
  {
    slug: 'ai',
    category: 'ai',
    icon: <IconSparkles size={28} />,
    image: FEATURE_IMAGES.ai,
  },
  {
    slug: 'zero-gp',
    category: 'sales',
    icon: <IconPercentage size={28} />,
    image: FEATURE_IMAGES['zero-gp'],
  },
  {
    slug: 'inventory',
    category: 'inventory',
    icon: <IconBox size={28} />,
    image: FEATURE_IMAGES.inventory,
  },
  {
    slug: 'pos',
    category: 'pos',
    icon: <IconDeviceLaptop size={28} />,
    image: FEATURE_IMAGES.pos,
  },
  {
    slug: 'online-store',
    category: 'sales',
    icon: <IconBuildingStore size={28} />,
    image: FEATURE_IMAGES['online-store'],
  },
  {
    slug: 'orders',
    category: 'sales',
    icon: <IconClipboardList size={28} />,
    image: FEATURE_IMAGES.orders,
  },
  {
    slug: 'analytics',
    category: 'sales',
    icon: <IconChartBar size={28} />,
    image: FEATURE_IMAGES.analytics,
  },
  {
    slug: 'payment',
    category: 'sales',
    icon: <IconCreditCard size={28} />,
    image: FEATURE_IMAGES.payment,
  },
  {
    slug: 'crm',
    category: 'marketing',
    icon: <IconUsers size={28} />,
    image: FEATURE_IMAGES.crm,
  },
  {
    slug: 'promotions',
    category: 'marketing',
    icon: <IconTicket size={28} />,
    image: FEATURE_IMAGES.promotions,
  },
  {
    slug: 'import-export',
    category: 'inventory',
    icon: <IconDatabaseImport size={28} />,
    image: FEATURE_IMAGES['import-export'],
  },
  {
    slug: 'logistics',
    category: 'sales',
    icon: <IconTruckDelivery size={28} />,
    image: FEATURE_IMAGES.logistics,
  },
]

export function getLocalizedFeature(
  slug: string,
  t: any,
): FeatureItem | undefined {
  const meta = FEATURE_METAS.find((m) => m.slug === slug)
  if (!meta) return undefined
  let itemData: any = null
  try {
    itemData = t.raw(`items.${slug}`)
  } catch {}
  if (!itemData) {
    itemData = (thFeatures.items as any)[slug]
  }
  if (!itemData) return undefined
  return {
    slug: meta.slug,
    category: meta.category,
    icon: meta.icon,
    image: meta.image || FEATURE_IMAGES[meta.slug],
    ...itemData,
  }
}

export function getLocalizedFeatures(t: any): FeatureItem[] {
  return FEATURE_METAS.map((meta) => {
    let itemData: any = null
    try {
      itemData = t.raw(`items.${meta.slug}`)
    } catch {}
    if (!itemData) {
      itemData = (thFeatures.items as any)[meta.slug]
    }
    return {
      slug: meta.slug,
      category: meta.category,
      icon: meta.icon,
      image: meta.image || FEATURE_IMAGES[meta.slug],
      ...(itemData || {}),
    }
  })
}

export const FEATURES_DATA: FeatureItem[] = FEATURE_METAS.map((meta) => {
  const itemData = (thFeatures.items as any)[meta.slug] || {}
  return {
    slug: meta.slug,
    category: meta.category,
    icon: meta.icon,
    ...itemData,
  }
})
