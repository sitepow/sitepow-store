'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { IconArrowRight, IconBuildingStore } from '@tabler/icons-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { Button } from '@/components/ui/button'

import { getManageUrl } from '@/lib/manage-url'

export interface CtaSectionProps {
  title?: string
  description?: string
  registerBtn?: string
  dashboardBtn?: string
  pricingBtn?: string
}

export function CtaSection({
  title,
  description,
  registerBtn,
  dashboardBtn,
  pricingBtn,
}: CtaSectionProps = {}) {
  const isMounted = useIsMounted()
  const t = useTranslations('home.cta')
  const { isAuthenticated } = useSession()
  const isAuth = isMounted && isAuthenticated

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', getManageUrl('/merchant/dashboard'))
  const registerHref = `/register?${registerParams.toString()}`

  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description', { gp: 0 })
  const resolvedRegisterBtn = registerBtn ?? t('registerBtn')
  const resolvedDashboardBtn = dashboardBtn ?? t('dashboardBtn')
  const resolvedPricingBtn = pricingBtn ?? t('pricingBtn')

  const ctaHref = isAuth ? getManageUrl('/merchant/dashboard') : registerHref
  const ctaLabel = isAuth ? resolvedDashboardBtn : resolvedRegisterBtn

  return (
    <section
      id="cta"
      className="border-border/40 relative w-full overflow-hidden border-t py-16 sm:py-20 md:py-24"
    >
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.2}
        duration={4}
        className="-z-10 mask-[radial-gradient(450px_circle_at_center,white,transparent)] opacity-50 sm:mask-[radial-gradient(700px_circle_at_center,white,transparent)] dark:opacity-20"
      />
      <div
        aria-hidden="true"
        className="from-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-72 w-140 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial via-orange-500/5 to-transparent blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
          <h2 className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
            {resolvedTitle}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed text-balance sm:text-base">
            {resolvedDescription}
          </p>

          <div className="mx-auto flex w-full max-w-xs flex-col items-stretch justify-center gap-3 pt-2 sm:max-w-none sm:flex-row sm:items-center sm:gap-3.5">
            <Button
              size="lg"
              asChild
              className="h-11 px-7 text-sm font-semibold shadow-sm sm:h-12"
            >
              <Link
                href={ctaHref}
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore className="size-4" />
                <span>{ctaLabel}</span>
                <IconArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border/80 bg-background/60 hover:bg-muted/80 h-11 px-7 text-sm font-medium backdrop-blur-sm sm:h-12"
            >
              <Link href="/pricing">{resolvedPricingBtn}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
