'use client'

import { ComponentProps, Suspense } from 'react'

import dynamic from 'next/dynamic'

import { ConversationType, UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'

import { cn } from '@/lib/utils'

import { Footer } from './Footer'
import { Navbar } from './navbar/Navbar'

const ChatWidget = dynamic(
  () => import('../chat/ChatWidget').then((mod) => mod.ChatWidget),
  { ssr: false },
)
const SupportWidget = dynamic(
  () => import('../chat/SupportWidget').then((mod) => mod.SupportWidget),
  { ssr: false },
)

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
