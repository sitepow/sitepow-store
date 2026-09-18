'use client'

import { ComponentProps, Suspense } from 'react'

import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'

import { cn } from '@/lib/utils'

import { ChatWidget } from '../chat/ChatWidget'
import { SupportWidget } from '../chat/SupportWidget'
import { Footer } from './Footer'
import { Navbar } from './navbar/Navbar'

export function MainLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  const { user } = useSession()
  const userRole = user?.role

  return (
    <div className="bg-background flex flex-col gap-10">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className={cn(className)} {...props}>
        {children}
      </main>

      <Footer />

      <Suspense>
        {userRole === UserRole.SUPPORT ? (
          <SupportWidget />
        ) : (
          <ChatWidget conversationType={ConversationType.SUPPORT} />
        )}
      </Suspense>
    </div>
  )
}
