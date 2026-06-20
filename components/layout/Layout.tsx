'use client'

import { ComponentProps } from 'react'

import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'

import { cn } from '@/lib/utils'

import { ProtectedByBrand } from '../ProtectedByBrand'
import { ChatWidget } from '../chat/chat-widget'
import { SupportWidget } from '../chat/support-widget'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function MainLayout({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  const { user } = useSession()
  const userRole = user?.role

  return (
    <div className="bg-background flex flex-col gap-10">
      <Navbar />
      <main className={cn(className)} {...props}>
        {children}
      </main>
      <Footer />
      <ProtectedByBrand />
      {userRole === UserRole.SUPPORT && <SupportWidget />}
      {userRole !== UserRole.SUPPORT && (
        <ChatWidget conversationType={ConversationType.SUPPORT} />
      )}
    </div>
  )
}
