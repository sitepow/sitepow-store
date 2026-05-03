import Link from 'next/link'

import { IconPackageImport } from '@tabler/icons-react'

export function LogoBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"
    >
      <IconPackageImport size={35} stroke={1.5} className="text-primary" />
      <div className="relative">
        <span>Sitepow</span>
        <span className="absolute -top-2 right-0 text-xs before:content-['Store']"></span>
      </div>
    </Link>
  )
}
