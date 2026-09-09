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
      title={
        <>
          บทความและสาระน่ารู้{' '}
          <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
            เพื่อธุรกิจยุคใหม่
          </span>
        </>
      }
      description={t('description')}
    />
  )
}
