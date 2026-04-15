import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function SectionContainer({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'container mx-auto flex flex-col items-center justify-center gap-5 px-10 py-10 text-center',
        className,
      )}
      {...props}
    ></section>
  )
}
