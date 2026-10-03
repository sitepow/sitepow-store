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
    <nav
      aria-label="เมนูหลักสำหรับมือถือ"
      className="flex flex-col space-y-4 px-6 py-8"
    >
      <ul className="flex flex-col space-y-4" role="list">
        {NAVBAR_ITEMS.map((item, idx) => (
          <li key={idx} className="flex flex-col">
            {item.children ? (
              <div className="space-y-4">
                <p className="text-sm font-bold opacity-40">{item.title}</p>
                <ul
                  role="list"
                  className="border-border ml-2 flex flex-col space-y-4 border-l-2 pl-4"
                >
                  {item.children.map((child) => (
                    <li key={child.title}>
                      <Link
                        href={child.href}
                        onClick={onClose}
                        className="active:text-primary text-lg font-semibold opacity-80"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
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
          </li>
        ))}
      </ul>
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
    </nav>
  )
}
