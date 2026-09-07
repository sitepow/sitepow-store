'use client'
import { useTranslations } from 'next-intl'

import { IconBook } from '@tabler/icons-react'

import { MainHeroHeader } from '../../_components/MainHeroHeader'

export function BlogsHeroSection() {
  const t = useTranslations('blogs')
  return (
    <MainHeroHeader
      badgeIcon={<IconBook size={15} />}
      badgeText={t('badge')}
      title={t('title')}
      description={t('description')}
    />
  )
}
