import { type ComponentPropsWithoutRef, type ReactNode } from 'react'

import Link from 'next/link'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string
  className?: string
  background?: ReactNode
  Icon?: React.ElementType
  description: string
  href?: string
  cta?: string
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full auto-rows-[22rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        'grid w-full auto-rows-auto grid-cols-1 gap-4 sm:auto-rows-[22rem] md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) {
  return (
    <div
      key={name}
      className={cn(
        'group relative flex min-h-[16rem] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 p-5 backdrop-blur-md transition-all duration-300 hover:shadow-xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/60',
        'transform-gpu',
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {background}
      </div>

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 transition-all duration-300 lg:group-hover:-translate-y-2">
        {Icon && (
          <div className="border-primary/20 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-12 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105">
            <Icon className="size-6" />
          </div>
        )}
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {name}
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>

      {href && (
        <Link
          href={href}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={name}
        />
      )}

      {href && cta && (
        <div className="relative z-20 mt-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="group/btn text-primary hover:text-primary -ml-2"
          >
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 font-medium"
            >
              {cta}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      )}

      <div className="group-hover:bg-primary/[0.02] group-hover:dark:bg-primary/[0.04] pointer-events-none absolute inset-0 rounded-2xl transition-all duration-300" />
    </div>
  )
}
