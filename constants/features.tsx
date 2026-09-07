import React from "react"
import thFeatures from "@/i18n/locales/th/features.json"
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
} from "@tabler/icons-react"

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
  category: "pos" | "ai" | "inventory" | "sales" | "marketing"
  categoryLabel: string
  icon: React.ReactNode
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
  category: "pos" | "ai" | "inventory" | "sales" | "marketing"
  icon: React.ReactNode
}

export const FEATURE_METAS: FeatureMeta[] = [
  { slug: "ai", category: "ai", icon: <IconSparkles size={28} /> },
  { slug: "zero-gp", category: "sales", icon: <IconPercentage size={28} /> },
  { slug: "inventory", category: "inventory", icon: <IconBox size={28} /> },
  { slug: "pos", category: "pos", icon: <IconDeviceLaptop size={28} /> },
  { slug: "online-store", category: "sales", icon: <IconBuildingStore size={28} /> },
  { slug: "orders", category: "sales", icon: <IconClipboardList size={28} /> },
  { slug: "analytics", category: "sales", icon: <IconChartBar size={28} /> },
  { slug: "payment", category: "sales", icon: <IconCreditCard size={28} /> },
  { slug: "crm", category: "marketing", icon: <IconUsers size={28} /> },
  { slug: "promotions", category: "marketing", icon: <IconTicket size={28} /> },
  { slug: "import-export", category: "inventory", icon: <IconDatabaseImport size={28} /> },
  { slug: "logistics", category: "sales", icon: <IconTruckDelivery size={28} /> },
]

export function getLocalizedFeature(slug: string, t: any): FeatureItem | undefined {
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
