import Link from 'next/link'

import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { NavigationItem } from '@/constants/store/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { IconLock } from '@tabler/icons-react'

// import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { QuickSettingsMenu } from '@/components/shared/QuickSettingsMenu'
import { Button } from '@/components/ui/button'

interface DesktopUserActionsProps {
  navbarItems: NavigationItem[]
  userRole?: UserRole
}

export function DesktopUserActions({
  navbarItems,
  userRole,
}: DesktopUserActionsProps) {
  return (
    <>
      <UserAvatarDropdown
        redirectPath="merchant"
        items={navbarItems}
        className="hidden lg:block"
      />
      {userRole === UserRole.MERCHANT && (
        <Button variant="secondary" className="flex gap-2 font-bold" asChild>
          <Link href="/merchant/dashboard">
            <IconLock />
            จัดการร้านค้าของคุณ
          </Link>
        </Button>
      )}
      <QuickSettingsMenu buttonVariant="secondary" />
      {/* <ModeToggle buttonVariant="secondary" /> */}
      {/* <LanguageSwitcher buttonVariant="secondary" /> */}
    </>
  )
}
