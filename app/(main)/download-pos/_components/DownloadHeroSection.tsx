'use client'
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  IconArrowDown,
  IconDeviceDesktop,
  IconWorld,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { MainHeroHeader } from "../../_components/MainHeroHeader"

export function DownloadHeroSection() {
  const t = useTranslations("downloadPos.hero")
  return (
    <MainHeroHeader
      badgeIcon={<IconDeviceDesktop size={15} />}
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
    >
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <Button
          size="lg"
          asChild
          className="shadow-primary/20 h-11 cursor-pointer px-6 text-sm font-semibold shadow-md"
        >
          <a href="#platforms" className="flex items-center gap-2">
            <IconArrowDown size={18} />
            <span>{t("selectOsBtn")}</span>
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-11 cursor-pointer px-6 text-sm font-medium"
        >
          <Link
            href="/merchant/pos"
            target="_blank"
            className="flex items-center gap-2"
          >
            <IconWorld size={18} />
            <span>{t("webPosBtn")}</span>
          </Link>
        </Button>
      </div>
    </MainHeroHeader>
  )
}
