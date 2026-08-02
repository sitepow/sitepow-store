'use client'

import { ComponentProps } from 'react'

import { ConversationType } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreData } from '@/stores/sites/use-store-data'

import { ChatWidget } from '@/components/chat/ChatWidget'
import { SupportWidget } from '@/components/chat/SupportWidget'

import { cn } from '@/lib/utils'

import { StoreFooter } from './Footer'
import { StoreNavbar } from './navbar/StoreNavbar'

export function StoreLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  const { store } = useStoreData()
  const { user } = useSession()

  const isOwner = !!user?.id && !!store?.ownerId && user.id === store.ownerId

  return (
    <div
      className="flex flex-col gap-10"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <StoreNavbar />
      <main
        className={cn(className, 'mt-24 sm:mt-20 lg:mt-32 xl:mt-36')}
        {...props}
      >
        {children}
      </main>
      <StoreFooter />
      {isOwner ? (
        <SupportWidget storeId={store?.id} />
      ) : (
        <ChatWidget
          conversationType={ConversationType.STORE}
          storeId={store?.id}
        />
      )}
    </div>
  )
}
