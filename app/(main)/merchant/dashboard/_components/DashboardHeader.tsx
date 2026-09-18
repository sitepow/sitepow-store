'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { IconExternalLink } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  showQuickLinks: boolean
  storeSlug?: string
}

export function DashboardHeader({
  showQuickLinks,
  storeSlug,
}: DashboardHeaderProps) {
  const t = useTranslations('merchant.dashboard')

  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <StoreSelectField />
        <BranchSelectField />
      </div>

      {showQuickLinks && (
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" asChild>
            <Link href="/merchant/settings" target="_blank">
              {t('settingsButton')} <IconExternalLink />
            </Link>
          </Button>
          {storeSlug && (
            <Button variant="outline" asChild>
              <Link href={`https://${storeSlug}.sitepow.store`} target="_blank">
                {t('viewStorefrontButton')} <IconExternalLink />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
