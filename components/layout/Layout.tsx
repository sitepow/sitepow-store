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
  id = 'main-content',
  ...props
}: ComponentProps<'main'>) {
  const { user } = useSession()
  const userRole = user?.role

  return (
    <div className="bg-background flex flex-col gap-10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        ข้ามไปยังเนื้อหาหลัก (Skip to content)
      </a>
      <Navbar />

      <main id={id} className={cn(className)} {...props}>
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
