import Link from 'next/link'

import { FALLBACK_MERCHANT_LOGO_IMAGE } from '@/constants/system'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { LockKeyholeIcon } from 'lucide-react'

import { StoreLogo } from '@/components/StoreLogo'
import { Button } from '@/components/ui/button'

export function StoreNavbarCheckout() {
  const { store } = useStoreData()

  const { isAuthenticated } = useSession()

  return (
    <div className="bg-background fixed z-50 w-full">
      <nav className="border-border container mx-auto flex flex-col gap-5 border-b px-10 py-5">
        <div className="flex items-center justify-between">
          <StoreLogo
            image={store?.logo ? store.logo : FALLBACK_MERCHANT_LOGO_IMAGE}
          />
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
