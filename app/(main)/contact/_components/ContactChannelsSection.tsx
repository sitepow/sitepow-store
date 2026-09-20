'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconBrandLine,
  IconBrandMessenger,
  IconExternalLink,
  IconMail,
  IconMessageDots,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

const CHANNEL_CONFIGS = [
  {
    id: 'line',
    icon: (
      <IconBrandLine
        className="size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7"
        stroke={1.75}
      />
    ),
    badgeColor:
      'text-[#06C755] bg-[#06C755]/10 group-hover:bg-[#06C755] group-hover:text-white',
    href: 'https://line.me/ti/p/~@830sdfow',
    isPrimary: true,
  },
  {
    id: 'messenger',
    icon: (
      <IconBrandMessenger
        className="size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7"
        stroke={1.75}
      />
    ),
    badgeColor:
      'text-[#0084FF] bg-[#0084FF]/10 group-hover:bg-[#0084FF] group-hover:text-white',
    href: 'https://m.me/61584675643468',
    isPrimary: false,
  },
  {
    id: 'chat',
    icon: (
      <IconMessageDots
        className="size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7"
        stroke={1.75}
      />
    ),
    badgeColor:
      'text-violet-500 bg-violet-500/10 group-hover:bg-violet-500 group-hover:text-white',
    href: '#chat-widget',
    isPrimary: false,
    onClick: () => {
      const btn = document.querySelector<HTMLButtonElement>(
        '[aria-label="support"], [aria-label="chat"]',
      )
      if (btn) btn.click()
    },
  },
  {
    id: 'email',
    icon: (
      <IconMail
        className="size-6 transition-transform duration-300 group-hover:scale-110 sm:size-7"
        stroke={1.75}
      />
    ),
    badgeColor:
      'text-amber-500 bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-white',
    href: 'mailto:support@sitepow.store',
    isPrimary: false,
  },
]

export function ContactChannelsSection() {
  const t = useTranslations('contact.channels')

  const channels = CHANNEL_CONFIGS.map((ch) => ({
    ...ch,
    title: t(`items.${ch.id}.title`),
    account: t(`items.${ch.id}.account`),
    badge: t(`items.${ch.id}.badge`),
    description: t(`items.${ch.id}.description`),
    buttonLabel: t(`items.${ch.id}.buttonLabel`),
  }))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
      <div>
        <MainSectionHeader title={t('title')} />
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={`group relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 sm:rounded-3xl sm:p-6 ${
              ch.isPrimary
                ? 'border-primary bg-card/95 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
                : 'border-border/80 bg-card/60 hover:border-border hover:bg-card border hover:shadow-md'
            }`}
          >
            {ch.isPrimary && (
              <>
                <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm sm:-top-3.5 sm:px-3 sm:text-xs">
                  {ch.badge}
                </div>
                <BorderBeam
                  size={140}
                  duration={7}
                  colorFrom="#22c55e"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
              </>
            )}

            <div>
              <div className="flex items-start justify-between">
                <div
                  className={`border-border/50 flex size-11 items-center justify-center rounded-xl border shadow-xs transition-all duration-300 sm:size-12 sm:rounded-2xl ${ch.badgeColor}`}
                >
                  {ch.icon}
                </div>
                {!ch.isPrimary && (
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5">
                    {ch.badge}
                  </span>
                )}
              </div>
              <div className="pt-2.5 sm:pt-4">
                <h3 className="text-foreground text-base font-bold sm:text-lg">
                  {ch.title}
                </h3>
                <div className="text-primary pt-0.5 text-xs font-semibold">
                  {ch.account}
                </div>
                <p className="text-muted-foreground min-h-auto pt-1.5 text-xs leading-relaxed sm:min-h-12 sm:pt-2.5">
                  {ch.description}
                </p>
              </div>
            </div>

            <div className="pt-3.5 sm:pt-6">
              {ch.onClick ? (
                ch.isPrimary ? (
                  <RainbowButton
                    onClick={ch.onClick}
                    className="flex h-9 w-full items-center justify-center gap-1.5 text-xs sm:h-10"
                  >
                    <span>{ch.buttonLabel}</span>
                    <IconExternalLink size={14} />
                  </RainbowButton>
                ) : (
                  <Button
                    onClick={ch.onClick}
                    variant="outline"
                    className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold sm:h-10"
                  >
                    <span>{ch.buttonLabel}</span>
                    <IconExternalLink size={14} />
                  </Button>
                )
              ) : ch.isPrimary ? (
                <RainbowButton
                  asChild
                  className="flex h-9 w-full items-center justify-center gap-1.5 text-xs sm:h-10"
                >
                  <Link
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{ch.buttonLabel}</span>
                    <IconExternalLink size={14} />
                  </Link>
                </RainbowButton>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold sm:h-10"
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
