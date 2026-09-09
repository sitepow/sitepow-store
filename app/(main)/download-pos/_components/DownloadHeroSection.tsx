'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconArrowDown,
  IconDeviceDesktop,
  IconWorld,
} from '@tabler/icons-react'

import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { MainHeroHeader } from '../../_components/MainHeroHeader'

export function DownloadHeroSection() {
  const t = useTranslations('downloadPos.hero')
  return (
    <MainHeroHeader
      badgeIcon={<IconDeviceDesktop size={15} />}
      badgeText={t('badgeText')}
      title={
        <>
          {t('titleStart')}{' '}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
            {t('titleGradient')}
          </span>
        </>
      }
      description={t('description')}
    >
      <div className="flex flex-col items-center justify-center gap-2.5 pt-1 sm:flex-row sm:gap-3 sm:pt-2">
        <RainbowButton
          size="lg"
          asChild
          className="h-10 w-full sm:h-11 sm:w-auto"
        >
          <a
            href="#platforms"
            className="flex items-center justify-center gap-2"
          >
            <IconArrowDown size={16} />
            <span>{t('selectOsBtn')}</span>
          </a>
        </RainbowButton>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-10 w-full cursor-pointer px-5 text-xs font-medium sm:h-11 sm:w-auto sm:px-6 sm:text-sm"
        >
          <Link
            href="/merchant/pos"
            target="_blank"
            className="flex items-center justify-center gap-2"
          >
            <IconWorld size={16} />
            <span>{t('webPosBtn')}</span>
          </Link>
        </Button>
      </div>
    </MainHeroHeader>
  )
}
