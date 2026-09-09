'use client'
import React from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandWindows,
  IconCheck,
  IconDeviceIpad,
  IconDownload,
  IconExternalLink,
  IconSparkles,
  IconWorld,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

interface PlatformConfig {
  id: 'windows' | 'android' | 'ios' | 'macos'
  version: string
  size: string
  requirements: string
  icon: React.ReactNode
  isFeatured?: boolean
  downloads: {
    href: string
    isPrimary?: boolean
    icon?: React.ReactNode
  }[]
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'windows',
    version: 'v2.4.0 (Latest)',
    size: '85 MB',
    requirements: 'Windows 10 / 11 (64-bit)',
    icon: <IconBrandWindows size={30} className="text-blue-500" />,
    isFeatured: true,
    downloads: [
      {
        href: '#',
        isPrimary: true,
        icon: <IconDownload size={15} />,
      },
      {
        href: '#',
        isPrimary: false,
        icon: <IconDownload size={15} />,
      },
    ],
  },
  {
    id: 'android',
    version: 'v2.4.0',
    size: '45 MB',
    requirements: 'Android 8.0+',
    icon: <IconBrandAndroid size={30} className="text-emerald-500" />,
    downloads: [
      {
        href: '#',
        isPrimary: true,
        icon: <IconDownload size={15} />,
      },
      {
        href: '#',
        isPrimary: false,
        icon: <IconExternalLink size={15} />,
      },
    ],
  },
  {
    id: 'ios',
    version: 'v2.4.0',
    size: '38 MB',
    requirements: 'iPadOS / iOS 15.0+',
    icon: <IconDeviceIpad size={30} className="text-indigo-500" />,
    downloads: [
      {
        href: '#',
        isPrimary: true,
        icon: <IconExternalLink size={15} />,
      },
      {
        href: '/merchant/pos',
        isPrimary: false,
        icon: <IconWorld size={15} />,
      },
    ],
  },
  {
    id: 'macos',
    version: 'v2.4.0',
    size: '92 MB',
    requirements: 'macOS 12.0+ (Apple Silicon & Intel)',
    icon: <IconBrandApple size={30} className="text-foreground" />,
    downloads: [
      {
        href: '#',
        isPrimary: true,
        icon: <IconDownload size={15} />,
      },
    ],
  },
]

export function DownloadPlatformsSection() {
  const t = useTranslations('downloadPos.platforms')
  const platforms = PLATFORM_CONFIGS.map((p) => ({
    ...p,
    name: t(`items.${p.id}.name`),
    badge: t(`items.${p.id}.badge`),
    description: t(`items.${p.id}.description`),
    features: [0, 1, 2, 3].map((fIdx) => t(`items.${p.id}.features.${fIdx}`)),
    downloads: p.downloads.map((d, bIdx) => ({
      ...d,
      label: t(`items.${p.id}.downloads.${bIdx}`),
    })),
  }))

  return (
    <section
      id="platforms"
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <MainSectionHeader
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />
      <div className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 sm:rounded-3xl sm:p-6 ${
              platform.isFeatured
                ? 'border-primary bg-card/90 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
                : 'border-border/80 bg-card/60 hover:border-border border hover:shadow-md'
            }`}
          >
            {platform.isFeatured && (
              <>
                <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm sm:-top-3.5 sm:px-3 sm:text-xs">
                  {t('recommendedBadge')}
                </div>
                <BorderBeam
                  size={140}
                  duration={8}
                  colorFrom="#f97316"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
              </>
            )}
            <div>
              <div className="flex items-start justify-between">
                <div className="bg-muted/80 flex size-10 items-center justify-center rounded-xl shadow-2xs sm:size-12 sm:rounded-2xl">
                  {platform.icon}
                </div>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5">
                  {platform.badge}
                </span>
              </div>
              <div className="pt-2.5 sm:pt-4">
                <h3 className="text-foreground text-base font-bold sm:text-lg">
                  {platform.name}
                </h3>
                <div className="text-muted-foreground flex items-center gap-2 pt-0.5 text-[11px]">
                  <span>{platform.version}</span>
                  <span>•</span>
                  <span>{platform.size}</span>
                </div>
                <p className="text-muted-foreground min-h-auto pt-1.5 text-xs leading-relaxed sm:min-h-12 sm:pt-2.5">
                  {platform.description}
                </p>
              </div>
              <div className="border-border/60 my-3.5 border-t sm:my-5" />
              <ul className="space-y-2 text-xs sm:space-y-2.5">
                {platform.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div
                      className="text-primary mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <IconCheck size={14} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 pt-4 sm:pt-6">
              {platform.downloads.map((btn, bIdx) => (
                <Button
                  key={bIdx}
                  asChild
                  variant={btn.isPrimary ? 'default' : 'outline'}
                  className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Link href={btn.href}>
                    {btn.icon}
                    <span>{btn.label}</span>
                  </Link>
                </Button>
              ))}
              <div className="text-muted-foreground pt-0.5 text-center text-[10px]">
                {t('systemRequirements')} {platform.requirements}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-primary/5 border-primary/20 relative flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 sm:gap-6 sm:rounded-3xl sm:p-8 md:flex-row">
        <div className="space-y-1.5 text-center sm:space-y-2 md:text-left">
          <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            <IconSparkles size={14} />
            <span>{t('webBanner.badge')}</span>
          </div>
          <h3 className="text-foreground text-lg font-bold sm:text-2xl">
            {t('webBanner.title')}
          </h3>
          <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
            {t('webBanner.description')}
          </p>
        </div>
        <RainbowButton
          size="lg"
          asChild
          className="h-10 w-full shrink-0 sm:h-11 sm:w-auto"
        >
          <Link
            href="/merchant/pos"
            target="_blank"
            className="flex items-center justify-center gap-2"
          >
            <IconWorld size={16} />
            <span>{t('webBanner.btn')}</span>
          </Link>
        </RainbowButton>
      </div>
    </section>
  )
}
