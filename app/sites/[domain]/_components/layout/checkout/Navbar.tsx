import Link from 'next/link'

import { useSession } from '@/hooks/use-session'
import { LockKeyholeIcon } from 'lucide-react'

import { LogoBrand } from '@/components/LogoBrand'
import { Button } from '@/components/ui/button'

export function StoreNavbarCheckout() {
  const { isAuthenticated } = useSession()

  return (
    <div className="fixed z-50 w-full bg-white">
      <nav className="container mx-auto flex flex-col gap-5 border-b border-gray-100 px-10 py-5">
        <div className="flex items-center justify-between">
          <LogoBrand />

          {!isAuthenticated && (
            <Link href={'/login'}>
              <Button variant="outline" size="icon-lg">
                <LockKeyholeIcon />
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
