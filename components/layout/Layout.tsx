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
  id = 'main-content',
  ...props
}: ComponentProps<'main'>) {
  const { user } = useSession()
  const userRole = user?.role

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:ring-2 focus:outline-hidden"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      <Suspense>
        <Navbar />
      </Suspense>

      <main
        id={id}
        tabIndex={-1}
        className={cn('flex-1 outline-hidden', className)}
        {...props}
      >
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
