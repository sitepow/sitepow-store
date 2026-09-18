'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { IconBuildingStore, IconCheck } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { getManageUrl } from '@/lib/manage-url'

export interface CtaSectionProps {
  badge?: string
  title?: string
  description?: string
  registerBtn?: string
  dashboardBtn?: string
  pricingBtn?: string
  trust1?: string
  trust2?: string
  trust3?: string
}

export function CtaSection({
  badge,
  title,
  description,
  registerBtn,
  dashboardBtn,
  pricingBtn,
  trust1,
  trust2,
  trust3,
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
  const resolvedTrust1 = trust1 ?? t('trust1')
  const resolvedTrust2 = trust2 ?? t('trust2', { minutes: 1 })
  const resolvedTrust3 = trust3 ?? t('trust3', { gp: 0, profit: 100 })

  return (
    <section
      id="cta"
      className="border-border/40 relative w-full overflow-hidden border-t py-16 sm:py-20 md:py-28"
    >
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.3}
        duration={3}
        className="-z-10 mask-[radial-gradient(500px_circle_at_center,white,transparent)] opacity-70 sm:mask-[radial-gradient(800px_circle_at_center,white,transparent)] dark:opacity-30"
      />
      <div
        aria-hidden="true"
        className="from-primary/20 dark:from-primary/15 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-80 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial via-orange-500/10 to-transparent blur-[130px] dark:via-orange-500/5"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
          <h2 className="text-foreground font-landing text-2xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-5xl">
            {resolvedTitle}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed text-balance sm:text-base md:text-lg">
            {resolvedDescription}
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-2.5 pt-2 sm:max-w-none sm:flex-row sm:items-center sm:gap-3.5 sm:pt-3">
            {!isAuth ? (
              <RainbowButton
                size="lg"
                asChild
                className="group shadow-primary/15 h-11 w-full shadow-lg sm:h-12 sm:w-auto sm:px-8"
              >
                <Link
                  href={registerHref}
                  className="flex items-center justify-center gap-2 text-sm font-bold sm:text-base"
                >
                  <IconBuildingStore className="size-4.5 sm:size-5" />
                  <span>{resolvedRegisterBtn}</span>
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </RainbowButton>
            ) : (
              <RainbowButton
                size="lg"
                asChild
                className="group shadow-primary/15 h-11 w-full shadow-lg sm:h-12 sm:w-auto sm:px-8"
              >
                <a
                  href={getManageUrl('/merchant/dashboard')}
                  className="flex items-center justify-center gap-2 text-sm font-bold sm:text-base"
                >
                  <IconBuildingStore className="size-4.5 sm:size-5" />
                  <span>{resolvedDashboardBtn}</span>
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </RainbowButton>
            )}
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border/80 bg-background/60 hover:bg-muted/80 h-11 w-full cursor-pointer px-6 text-xs font-semibold backdrop-blur-md transition-all sm:h-12 sm:w-auto sm:px-7 sm:text-sm"
            >
              <Link href="/pricing" className="text-center">
                {resolvedPricingBtn}
              </Link>
            </Button>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-[11px] font-medium sm:text-xs">
            <span className="flex items-center gap-1.5">
              <IconCheck
                className="size-3.5 shrink-0 text-emerald-500"
                strokeWidth={2.5}
              />
              {resolvedTrust1}
            </span>
            <span className="bg-border hidden size-1 rounded-full sm:inline-block" />
            <span className="flex items-center gap-1.5">
              <IconCheck
                className="size-3.5 shrink-0 text-emerald-500"
                strokeWidth={2.5}
              />
              {resolvedTrust2}
            </span>
            <span className="bg-border hidden size-1 rounded-full sm:inline-block" />
            <span className="flex items-center gap-1.5">
              <IconCheck
                className="size-3.5 shrink-0 text-emerald-500"
                strokeWidth={2.5}
              />
              {resolvedTrust3}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
