import { ComponentProps } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { useStoreData } from '@/stores/sites/use-store-data'

import { cn } from '@/lib/utils'

type LogoBrandProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  hideLogo?: boolean
}

export function LogoBrand({
  className,
  hideLogo = false,
  ...props
}: LogoBrandProps) {
  const { store } = useStoreData()

  return (
    <Link
      href="/"
      className={cn(
        'text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight',
        className,
      )}
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      {...props}
    >
      {!hideLogo && (
        <Image
          src="/images/logo-brand-gray.png"
          width={150}
          height={150}
          className="size-8.75"
          alt="sitepow-logo"
        />
      )}
      <div className="relative">
        <span>Sitepow</span>
        <span className="absolute -top-2 right-0 text-xs before:content-['Store']"></span>
      </div>
    </Link>
  )
}
