'use client'
import { useTranslations } from "next-intl"
import { MainFaqAccordion } from "@/app/(main)/_components/MainFaqAccordion"
import { MainSectionHeader } from "@/app/(main)/_components/MainSectionHeader"

export function FaqSection() {
  const t = useTranslations("home.faq")
  const items = [0, 1, 2, 3, 4].map((idx) => ({
    q: t(`items.${idx}.q`),
    a: t(`items.${idx}.a`),
  }))
  return (
    <section id="faq" className="border-border/40 relative w-full border-t py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />
        <MainFaqAccordion items={items} idPrefix="landing-faq" />
      </div>
    </section>
  )
}
