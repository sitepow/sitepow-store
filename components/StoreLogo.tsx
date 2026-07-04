import { ComponentProps } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { FALLBACK_IMAGE } from '@/constants/system'

import { cn } from '@/lib/utils'

interface StoreLogoProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  image?: string
}

export function StoreLogo({ image, className, ...props }: StoreLogoProps) {
  return (
    <Link
      href="/"
      className={cn('block h-14 w-fit max-w-50 overflow-hidden', className)}
      {...props}
    >
      <Image
        width={200}
        height={80}
        alt="store-logo"
        unoptimized
        src={image || FALLBACK_IMAGE}
        className="size-full object-contain object-center"
      />
    </Link>
  )
}
