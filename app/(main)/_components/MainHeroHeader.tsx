'use client'
import { ComponentProps, ReactNode, useRef } from 'react'

import { useIsMounted } from '@/hooks/use-is-mounted'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'

import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

interface MainHeroHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  badgeIcon?: ReactNode
  badgeText?: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

export function MainHeroHeader({
  badgeIcon,
  badgeText,
  title,
  description,
  children,
  className,
  ...props
}: MainHeroHeaderProps) {
  const isMounted = useIsMounted()
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return
      const targets = contentRef.current?.children
      if (!targets || targets.length === 0) return

      gsap.fromTo(
        targets,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
        },
      )
    },
    { scope: containerRef, dependencies: [isMounted] },
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative mx-auto w-full max-w-3xl space-y-4 px-3.5 pt-4 pb-2 text-center sm:space-y-6 sm:px-6 sm:pt-8 sm:pb-4 lg:px-8',
        className,
      )}
      {...props}
    >
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.3}
        duration={3}
        className="-z-10 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)] opacity-60 sm:[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] dark:opacity-30"
      />
      <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div ref={contentRef} className="space-y-4 sm:space-y-6">
        {badgeText && (
          <div>
            <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold shadow-2xs sm:px-3.5 sm:py-1">
              {badgeIcon}
              <AnimatedShinyText className="text-primary dark:text-primary">
                {badgeText}
              </AnimatedShinyText>
            </div>
          </div>
        )}
        <div className="space-y-2.5 sm:space-y-4">
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mx-auto max-w-3xl text-xs leading-relaxed text-balance sm:text-base md:text-lg">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
