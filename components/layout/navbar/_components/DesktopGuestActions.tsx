import Link from 'next/link'

import { QuickSettingsMenu } from '@/components/QuickSettingsMenu'
import { Button } from '@/components/ui/button'

interface DesktopGuestActionsProps {
  loginHref: string
  registerHref: string
}

export function DesktopGuestActions({
  loginHref,
  registerHref,
}: DesktopGuestActionsProps) {
  return (
    <>
      <Link href={loginHref}>
        <Button variant="secondary" className="font-bold">
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href={registerHref}>
        <Button className="font-bold">สมัครเปิดร้าน</Button>
      </Link>
      <QuickSettingsMenu buttonVariant="secondary" />
    </>
  )
}
