import { ComponentProps } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface StoreLogoProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  image?: string
}

export function StoreLogo({ image, className, ...props }: StoreLogoProps) {
  return (
    <Link
      href="/"
      className={cn('block h-20 w-fit max-w-50 overflow-hidden', className)}
      {...props}
    >
      <Image
        width={200}
        height={80}
        alt="store-logo"
        unoptimized
        src={image || '/images/navigation/navigation-header.jpeg'}
        className="size-full object-contain object-center"
      />
    </Link>
  )
}
