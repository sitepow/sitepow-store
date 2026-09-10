'use client'
import { useTranslations } from 'next-intl'

import { IconBook } from '@tabler/icons-react'

import { MainHeroHeader } from '../../_components/MainHeroHeader'

export interface BlogsHeroSectionProps {
  badgeText?: string
  title?: React.ReactNode
  description?: string
}

export function BlogsHeroSection({
  badgeText,
  title,
  description,
}: BlogsHeroSectionProps = {}) {
  const t = useTranslations('blogs')
  const resolvedBadge = badgeText ?? t('badge')
  const resolvedTitle = title ?? (
    <>
      บทความและสาระน่ารู้{' '}
      <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
        เพื่อธุรกิจยุคใหม่
      </span>
    </>
  )
  const resolvedDescription = description ?? t('description')

  return (
    <MainHeroHeader
      badgeIcon={<IconBook size={15} />}
      badgeText={resolvedBadge}
      title={resolvedTitle}
      description={resolvedDescription}
    />
  )
}
