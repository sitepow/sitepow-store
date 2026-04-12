import Link from 'next/link'

import { PackageCheckIcon } from 'lucide-react'

export function LogoBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"
    >
      <PackageCheckIcon size={35} className="text-primary" />
      <div className="relative">
        <span>Sitepow</span>
        <span className="absolute -top-2 right-0 text-xs before:content-['Store']"></span>
      </div>
    </Link>
  )
}
