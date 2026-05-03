import { PropsWithChildren } from 'react'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { StoreAdminAppSidebar } from './Sidebar'

export function StoreAdminLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <StoreAdminAppSidebar />
      <main className="w-full p-5">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
