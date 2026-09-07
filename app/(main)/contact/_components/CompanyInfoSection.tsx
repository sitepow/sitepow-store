'use client'
import { useTranslations } from "next-intl"
import {
  IconClock,
  IconPercentage,
  IconServer,
  IconShieldCheck,
} from "@tabler/icons-react"
import { MainSectionHeader } from "../../_components/MainSectionHeader"

const INFO_ICONS = [IconServer, IconShieldCheck, IconClock, IconPercentage]

export function CompanyInfoSection() {
  const t = useTranslations("contact.companyInfo")
  const items = INFO_ICONS.map((Icon, idx) => ({
    icon: <Icon size={24} />,
    title: t(`items.${idx}.title`),
    description: t(`items.${idx}.description`),
  }))
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
          >
            <div className="space-y-3">
              <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                {item.icon}
              </div>
              <h3 className="text-foreground text-base font-bold">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
