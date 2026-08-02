import Link from 'next/link'

import { LockIcon } from 'lucide-react'

// import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ModeToggle } from '@/components/ModeToggle'
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
        <Button variant="secondary" className="flex gap-2 font-bold">
          <LockIcon size={18} />
          เข้าสู่ระบบ
        </Button>
      </Link>
      <Link href={registerHref}>
        <Button className="font-bold">สมัครเปิดร้าน</Button>
      </Link>
      <ModeToggle buttonVariant="secondary" />
      {/* <LanguageSwitcher buttonVariant="secondary" /> */}
    </>
  )
}
