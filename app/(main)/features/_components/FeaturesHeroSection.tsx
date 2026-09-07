'use client'
import { useTranslations } from "next-intl"
import { IconSparkles } from "@tabler/icons-react"
import { MainHeroHeader } from "../../_components/MainHeroHeader"

export function FeaturesHeroSection() {
  const t = useTranslations("features.hero")
  return (
    <MainHeroHeader
      badgeIcon={<IconSparkles size={15} />}
      badgeText={t("badgeText")}
      title={
        <>
          {t("titleStart")}{" "}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
            {t("titleGradient")}
          </span>
        </>
      }
      description={t("description")}
    />
  )
}
