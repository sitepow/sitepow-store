'use client'
import { useTranslations } from "next-intl"
import {
  IconBuildingStore,
  IconDownload,
  IconPlugConnected,
} from "@tabler/icons-react"
import { Safari } from "@/components/magicui/safari"
import { MainSectionHeader } from "../../_components/MainSectionHeader"

const STEP_ICONS = [
  <IconDownload key="dl" size={20} />,
  <IconBuildingStore key="bs" size={20} />,
  <IconPlugConnected key="pc" size={20} />,
]

export function QuickSetupSection() {
  const t = useTranslations("downloadPos.quickSetup")
  const steps = [0, 1, 2].map((idx) => ({
    step: `0${idx + 1}`,
    title: t(`steps.${idx}.title`),
    description: t(`steps.${idx}.description`),
    icon: STEP_ICONS[idx],
  }))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">
                  Step {s.step}
                </span>
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-foreground text-lg font-bold">{s.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="relative mx-auto w-full max-w-4xl pt-2">
        <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
          <Safari
            url="pos.sitepow.store/cashier"
            mode="simple"
            className="w-full"
          >
            <div className="size-full bg-neutral-200 transition-colors dark:bg-neutral-800" />
          </Safari>
        </div>
      </div>
    </div>
  )
}
