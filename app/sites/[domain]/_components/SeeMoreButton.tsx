'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SeeMoreButtonProps {
  href: string
}

export function SeeMoreButton({ href }: SeeMoreButtonProps) {
  const t = useTranslations('storefront.products')

  return (
    <Link href={href} className="flex shrink-0 items-center justify-center">
      <Button variant="outline" className="whitespace-nowrap">
        <span>{t('viewAll')}</span>
        <ArrowRightIcon className="size-4" />
      </Button>
    </Link>
  )
}
