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
      className="flex min-h-screen flex-col"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        ข้ามไปยังเนื้อหาหลัก (Skip to content)
      </a>
      <StoreNavbar />
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className={cn(className, 'flex-1 mt-24 sm:mt-20 lg:mt-32 xl:mt-36 focus:outline-none')}
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
