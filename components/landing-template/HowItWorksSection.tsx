'use client'
import { useState } from "react"
import { useTranslations } from "next-intl"
import { MainSectionHeader } from "@/app/(main)/_components/MainSectionHeader"
import { Safari } from "@/components/magicui/safari"

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const t = useTranslations("home.howItWorks")
  const steps = [
    {
      step: "01",
      title: t("steps.0.title"),
      description: t("steps.0.description"),
      badge: t("steps.0.badge"),
    },
    {
      step: "02",
      title: t("steps.1.title"),
      description: t("steps.1.description"),
      badge: t("steps.1.badge"),
    },
    {
      step: "03",
      title: t("steps.2.title"),
      description: t("steps.2.description"),
      badge: t("steps.2.badge"),
    },
  ]
  return (
    <section id="how-it-works" className="relative w-full py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-5">
            {steps.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                  activeStep === idx
                    ? "border-primary/40 bg-primary/4 dark:bg-primary/8 shadow-md"
                    : "border-border/60 bg-card hover:border-border"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        activeStep === idx
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.step}
                    </span>
                    <span className="text-card-foreground text-sm font-bold sm:text-base">
                      {s.title}
                    </span>
                  </div>
                  <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                    {s.badge}
                  </span>
                </div>
                <p className="text-muted-foreground mt-3 pl-0 text-xs leading-relaxed sm:pl-11 sm:text-sm">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-7">
            <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
              <Safari
                url={
                  activeStep === 0
                    ? "sitepow.store/register"
                    : activeStep === 1
                      ? "sitepow.store/merchant/products"
                      : "sitepow.store/merchant/pos"
                }
                mode="simple"
                className="w-full"
              >
                <div className="size-full bg-neutral-200 transition-colors dark:bg-neutral-800" />
              </Safari>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
