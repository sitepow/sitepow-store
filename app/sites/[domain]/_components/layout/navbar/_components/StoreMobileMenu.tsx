import Link from 'next/link'

import { STORE_NAVBAR_ITEMS } from '@/constants/sites/navbar'
import { LockKeyholeIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import { CategoryDropdown } from '../../../CategoryDropdown'

interface StoreMobileMenuProps {
  storeSlug?: string
  isAuthenticated: boolean
  loginHref: string
  onClose: () => void
}

export function StoreMobileMenu({
  storeSlug,
  isAuthenticated,
  loginHref,
  onClose,
}: StoreMobileMenuProps) {
  return (
    <div className="flex flex-col space-y-6 px-6 py-8 pb-20">
      <ButtonGroup className="w-full">
        <Input placeholder="ค้นหาสินค้าที่ต้องการ..." className="h-12" />
        <Button variant="outline" className="h-12">
          <SearchIcon size={18} />
        </Button>
      </ButtonGroup>
      <CategoryDropdown storeSlug={storeSlug} />
      <Separator />
      <div className="flex flex-col space-y-5">
        {STORE_NAVBAR_ITEMS.map((item, idx) => (
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
                      className="active:text-primary text-lg font-semibold opacity-80 transition-colors"
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
                className="text-xl font-bold"
              >
                {item.title}
              </Link>
            )}
          </div>
        ))}
      </div>
      {!isAuthenticated && (
        <>
          <Separator />
          <Link href={loginHref} onClick={onClose}>
            <Button
              variant="outline"
              className="w-full gap-3 border-2 py-8 text-lg font-bold"
            >
              <LockKeyholeIcon size={22} />
              เข้าสู่ระบบ / สมัครสมาชิก
            </Button>
          </Link>
        </>
      )}
    </div>
  )
}
