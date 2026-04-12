import { PropsWithChildren } from 'react'

import { Footer } from './Footer'
import { Navbar } from './Navbar'

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-10">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
