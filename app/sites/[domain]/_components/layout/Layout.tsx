'use client'

import { ComponentProps } from 'react'

import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'

import { ChatWidget } from '@/components/chat/chat-widget'
import { SupportWidget } from '@/components/chat/support-widget'

import { cn } from '@/lib/utils'

import { StoreFooter } from './Footer'
import { StoreNavbar } from './Navbar'

export function StoreLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  const { store } = useStoreData()

  const { user } = useSession()
  const userRole = user?.role

  return (
    <div className="flex flex-col gap-10">
      <StoreNavbar />
      <main
        className={cn(className, 'mt-24 sm:mt-20 lg:mt-32 xl:mt-36')}
        style={{ '--brand-color': store?.primaryColor } as React.CSSProperties}
        {...props}
      >
        {children}
      </main>
      <StoreFooter />
      {userRole === UserRole.MERCHANT && <SupportWidget storeId={store?.id} />}
      {userRole !== UserRole.MERCHANT && (
        <ChatWidget
          conversationType={ConversationType.STORE}
          storeId={store?.id}
        />
      )}
    </div>
  )
}
