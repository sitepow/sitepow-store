import Link from 'next/link'

import { UserAvatarDropdown } from '@/app/sites/[domain]/_components/UserAvatarDropdown'
import { NavigationItem } from '@/constants/navigation'
import { UserRole } from '@/generated/prisma/enums'
import { IconLock } from '@tabler/icons-react'

// import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ModeToggle } from '@/components/ModeToggle'
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
          <Link href="/merchant/dashboard" target="_blank">
            <IconLock />
            จัดการร้านค้าของคุณ
          </Link>
        </Button>
      )}
      <ModeToggle buttonVariant="secondary" />
      {/* <LanguageSwitcher buttonVariant="secondary" /> */}
    </>
  )
}
