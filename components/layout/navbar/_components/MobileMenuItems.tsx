import Link from 'next/link'

import { NAVBAR_ITEMS } from '@/constants/navbar'
import { LockIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface MobileMenuItemsProps {
  onClose: () => void
  isAuthenticated: boolean
  loginHref: string
  registerHref: string
}

export function MobileMenuItems({
  onClose,
  isAuthenticated,
  loginHref,
  registerHref,
}: MobileMenuItemsProps) {
  return (
    <div className="flex flex-col space-y-4 px-6 py-8">
      {NAVBAR_ITEMS.map((item, idx) => (
        <div key={idx} className="flex flex-col">
          {item.children ? (
            <div className="space-y-4">
              <p className="text-sm font-bold opacity-40">{item.title}</p>
              <div className="border-border ml-2 flex flex-col space-y-4 border-l-2 pl-4">
                {item.children.map((child) => (
                  <Link
                    key={child.title}
                    href={child.href}
                    onClick={onClose}
                    className="active:text-primary text-lg font-semibold opacity-80"
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              href={item.href!}
              onClick={onClose}
              className="text-foreground text-xl font-bold"
            >
              {item.title}
            </Link>
          )}
        </div>
      ))}
      {!isAuthenticated && (
        <>
          <div className="pt-4">
            <Separator />
          </div>
          <div className="flex flex-col gap-3 pt-4 pb-10">
            <Link href={loginHref} onClick={onClose}>
              <Button
                variant="secondary"
                className="w-full justify-center gap-2 py-7 text-lg font-bold"
              >
                <LockIcon size={20} />
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href={registerHref} onClick={onClose}>
              <Button className="w-full justify-center py-7 text-lg font-bold">
                สมัครเปิดร้าน
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
