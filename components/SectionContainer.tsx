import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function SectionContainer({
  className,
  ...props
}: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'container mx-auto flex flex-col items-center justify-center gap-5 p-5 text-center sm:px-10 sm:py-10',
        'container mx-auto flex flex-col items-center justify-center gap-5 p-5 text-center sm:px-10 sm:py-10 [content-visibility:auto] [contain-intrinsic-size:auto_none_auto_600px]',
        className,
      )}
      {...props}
    ></section>
  )
}
