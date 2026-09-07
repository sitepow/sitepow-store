'use client'
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import {
  IconExternalLink,
  IconMail,
  IconMessageDots,
} from "@tabler/icons-react"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Button } from "@/components/ui/button"
import { MainSectionHeader } from "../../_components/MainSectionHeader"

const CHANNEL_CONFIGS = [
  {
    id: "line",
    icon: (
      <Image
        src="https://thesvg.org/icons/line/default.svg"
        alt="Line"
        width={28}
        height={28}
      />
    ),
    href: "https://line.me/ti/p/~@830sdfow",
    isPrimary: true,
  },
  {
    id: "messenger",
    icon: (
      <Image
        src="https://thesvg.org/icons/messenger/default.svg"
        alt="Messenger"
        width={28}
        height={28}
      />
    ),
    href: "https://m.me/61584675643468",
    isPrimary: false,
  },
  {
    id: "chat",
    icon: <IconMessageDots size={28} className="text-violet-500" />,
    href: "#chat-widget",
    isPrimary: false,
    onClick: () => {
      const btn = document.querySelector<HTMLButtonElement>(
        '[aria-label="support"], [aria-label="chat"]',
      )
      if (btn) btn.click()
    },
  },
  {
    id: "email",
    icon: <IconMail size={28} className="text-amber-500" />,
    href: "mailto:support@sitepow.store",
    isPrimary: false,
  },
]

export function ContactChannelsSection() {
  const t = useTranslations("contact.channels")
  const channels = CHANNEL_CONFIGS.map((ch) => ({
    ...ch,
    title: t(`items.${ch.id}.title`),
    account: t(`items.${ch.id}.account`),
    badge: t(`items.${ch.id}.badge`),
    description: t(`items.${ch.id}.description`),
    buttonLabel: t(`items.${ch.id}.buttonLabel`),
  }))
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <MainSectionHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={`relative flex flex-col justify-between rounded-3xl p-5 transition-all duration-300 sm:p-6 ${
              ch.isPrimary
                ? "border-primary bg-card/90 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2"
                : "border-border/80 bg-card/60 hover:border-border border hover:shadow-md"
            }`}
          >
            {ch.isPrimary && (
              <>
                <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold shadow-sm">
                  {ch.badge}
                </div>
                <BorderBeam
                  size={140}
                  duration={8}
                  colorFrom="#22c55e"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
              </>
            )}
            <div>
              <div className="flex items-start justify-between">
                <div className="bg-muted flex size-12 items-center justify-center rounded-2xl shadow-2xs">
                  {ch.icon}
                </div>
                {!ch.isPrimary && (
                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                    {ch.badge}
                  </span>
                )}
              </div>
              <div className="pt-4">
                <h3 className="text-foreground text-lg font-bold">
                  {ch.title}
                </h3>
                <div className="text-primary pt-0.5 text-xs font-semibold">
                  {ch.account}
                </div>
                <p className="text-muted-foreground min-h-12 pt-2.5 text-xs leading-relaxed">
                  {ch.description}
                </p>
              </div>
            </div>
            <div className="pt-6">
              {ch.onClick ? (
                <Button
                  onClick={ch.onClick}
                  variant={ch.isPrimary ? "default" : "outline"}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <span>{ch.buttonLabel}</span>
                  <IconExternalLink size={14} />
                </Button>
              ) : (
                <Button
                  asChild
                  variant={ch.isPrimary ? "default" : "outline"}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Link
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{ch.buttonLabel}</span>
                    <IconExternalLink size={14} />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
