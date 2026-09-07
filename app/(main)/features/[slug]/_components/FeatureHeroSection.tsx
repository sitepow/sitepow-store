'use client'
import { useTranslations } from "next-intl"
import Link from "next/link"
import { FeatureItem } from "@/constants/features"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function FeatureHeroSection({
  feature,
  registerHref,
}: {
  feature: FeatureItem
  registerHref: string
}) {
  const t = useTranslations("features.detail")
  return (
    <div className="relative mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-4 text-center sm:px-6 lg:px-8">
      <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
        <Link
          href="/features"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>{t("backToAll")}</span>
        </Link>
        <IconChevronRight size={12} />
        <span className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2.5 py-0.5 font-semibold">
          {feature.categoryLabel}
        </span>
      </div>
      <div className="space-y-4">
        <div className="bg-card/80 text-primary border-border/80 shadow-primary/5 mx-auto inline-flex size-20 items-center justify-center rounded-3xl border shadow-xl backdrop-blur-md">
          {feature.icon}
        </div>
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {feature.title}
        </h1>
        <p className="text-primary text-base font-semibold sm:text-xl">
          {feature.tagline}
        </p>
        <p className="text-muted-foreground mx-auto max-w-3xl text-sm leading-relaxed text-balance sm:text-base">
          {feature.fullDescription}
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 pt-2 sm:max-w-none sm:flex-row sm:items-center">
        <Button
          size="lg"
          asChild
          className="shadow-primary/25 h-12 w-full cursor-pointer rounded-full px-7 text-sm font-semibold shadow-lg transition-transform hover:scale-105 sm:w-auto"
        >
          <Link
            href={registerHref}
            className="flex items-center justify-center gap-2"
          >
            <IconBuildingStore size={18} />
            <span>{t("registerBtn")}</span>
            <IconArrowRight size={16} />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-12 w-full cursor-pointer rounded-full px-7 text-sm font-medium transition-all sm:w-auto"
        >
          <Link href="/pricing" className="text-center">
            {t("pricingBtn")}
          </Link>
        </Button>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
        {feature.metrics.map((metric, mIdx) => (
          <div
            key={mIdx}
            className="bg-card/70 border-border/80 relative flex flex-col items-center justify-center rounded-3xl border p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:shadow-md"
          >
            <div className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
              <span className="from-primary bg-linear-to-r to-orange-500 bg-clip-text text-transparent">
                {metric.value}
              </span>
            </div>
            <div className="text-foreground pt-1.5 text-sm font-bold">
              {metric.label}
            </div>
            <div className="text-muted-foreground pt-1 text-center text-xs">
              {metric.desc}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 pt-2 text-left text-xs sm:grid-cols-2 sm:text-sm">
        {feature.highlights.map((item, idx) => (
          <div
            key={idx}
            className="bg-card/60 border-border/60 flex items-center gap-2.5 rounded-2xl border p-3.5 shadow-2xs"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconCheck size={13} strokeWidth={3} />
            </div>
            <span className="text-foreground/90 leading-tight font-medium">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
