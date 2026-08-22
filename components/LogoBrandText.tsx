'use client'

import { ComponentProps } from 'react'

import Link from 'next/link'

import { useStoreData } from '@/stores/sites/use-store-data'

import { cn } from '@/lib/utils'

type LogoBrandTextProps = Omit<ComponentProps<typeof Link>, 'href'> & {}

export function LogoBrandText({ className, ...props }: LogoBrandTextProps) {
  const { store } = useStoreData()

  return (
    <Link
      href="/"
      className={cn(
        'group relative flex items-center font-extrabold tracking-tight transition-opacity select-none hover:opacity-90',
        className,
      )}
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      {...props}
    >
      <span className="line-clamp-2 max-w-64 bg-linear-to-r bg-clip-text text-2xl">
        {store?.name}
      </span>
    </Link>
  )
}
