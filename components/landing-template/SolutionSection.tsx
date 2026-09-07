'use client'
import { useTranslations } from "next-intl"
import { IconCpu, IconFlame, IconQrcode } from "@tabler/icons-react"
import { MainSectionHeader } from "@/app/(main)/_components/MainSectionHeader"
import { Safari } from "@/components/magicui/safari"

const SOLUTION_CONFIGS = [
  {
    icon: <IconQrcode size={22} />,
    url: "pos.sitepow.store",
    videoSrc: "/pos-section.webm",
  },
  {
    icon: <IconCpu size={22} />,
    url: "ai.sitepow.store",
  },
  {
    icon: <IconFlame size={22} />,
    url: "app.sitepow.store",
  },
]

export function SolutionSection() {
  const t = useTranslations("home.solution")
  const items = SOLUTION_CONFIGS.map((config, idx) => ({
    ...config,
    title: t(`items.${idx}.title`),
    description: t(`items.${idx}.description`),
  }))
  return (
    <section id="solution" className="bg-muted/40 border-border/40 relative w-full border-y py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <div>
                <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                  {item.icon}
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground pt-2 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>
              <div className="border-border relative mt-6 overflow-hidden rounded-xl border shadow-xs transition-transform duration-300 group-hover:-translate-y-1">
                <Safari
                  url={item.url}
                  mode={item.videoSrc ? undefined : "simple"}
                  videoSrc={item.videoSrc}
                  className="w-full"
                >
                  {!item.videoSrc && (
                    <div className="aspect-video size-full bg-neutral-200 dark:bg-neutral-800" />
                  )}
                </Safari>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
