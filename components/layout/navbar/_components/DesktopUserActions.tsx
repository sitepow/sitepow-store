'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { NavigationItem } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { IconLock } from '@tabler/icons-react'

import { QuickSettingsMenu } from '@/components/QuickSettingsMenu'
import { Button } from '@/components/ui/button'

interface DesktopUserActionsProps {
  navbarItems: NavigationItem[]
  userRole?: UserRole
}

export function DesktopUserActions({
  navbarItems,
  userRole,
}: DesktopUserActionsProps) {
  const t = useTranslations('common.navbar')
  return (
    <>
      <UserAvatarDropdown
        redirectPath="merchant"
        items={navbarItems}
        className="hidden lg:block"
      />
      {userRole === UserRole.MERCHANT && (
        <Button variant="outline" className="flex gap-2 font-medium" asChild>
          <Link href="/merchant/dashboard">
            <IconLock />
            {t('manageStore')}
          </Link>
        </Button>
      )}
      <QuickSettingsMenu buttonVariant="ghost" />
    </>
  )
}
