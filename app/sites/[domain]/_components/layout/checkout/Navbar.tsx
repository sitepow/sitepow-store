import Link from 'next/link'

import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'
import { LockKeyholeIcon } from 'lucide-react'

import { LogoBrandText } from '@/components/LogoBrandText'
import { StoreLogo } from '@/components/StoreLogo'
import { Button } from '@/components/ui/button'

export function StoreNavbarCheckout() {
  const { store } = useStoreData()

  const { isAuthenticated } = useSession()

  return (
    <div className="bg-background fixed z-50 w-full">
      <nav className="border-border container mx-auto flex flex-col gap-5 border-b px-10 py-5">
        <div className="flex items-center justify-between">
          {store?.logo ? <StoreLogo image={store?.logo} /> : <LogoBrandText />}
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
