'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconBuildingStore } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  const t = useTranslations('home.cta')
  const { isAuthenticated } = useSession()
  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`
  return (
    <section
      id="cta"
      className="bg-muted/50 border-border/40 relative w-full overflow-hidden border-t py-10 sm:py-16 md:py-24"
    >
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.35}
        duration={3}
        className="-z-10 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)] opacity-70 sm:[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] dark:opacity-35"
      />
      <div className="mx-auto w-full max-w-5xl px-3.5 text-center sm:px-6 lg:px-8">
        <div className="bg-primary/20 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
          <h2 className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-xs text-balance sm:text-lg">
            {t('description')}
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-2.5 pt-1 sm:max-w-none sm:flex-row sm:items-center sm:gap-3 sm:pt-2">
            {!isAuthenticated ? (
              <RainbowButton
                size="lg"
                asChild
                className="h-10 w-full sm:h-11 sm:w-auto"
              >
                <Link
                  href={registerHref}
                  className="flex items-center justify-center gap-2"
                >
                  <IconBuildingStore className="size-4 sm:size-5" />
                  <span>{t('registerBtn')}</span>
                  <ArrowRight className="size-3.5 sm:size-4" />
                </Link>
              </RainbowButton>
            ) : (
              <RainbowButton
                size="lg"
                asChild
                className="h-10 w-full sm:h-11 sm:w-auto"
              >
                <Link
                  href="/merchant/dashboard"
                  className="flex items-center justify-center gap-2"
                >
                  <IconBuildingStore className="size-4 sm:size-5" />
                  <span>{t('dashboardBtn')}</span>
                  <ArrowRight className="size-3.5 sm:size-4" />
                </Link>
              </RainbowButton>
            )}
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-10 w-full cursor-pointer px-5 text-xs font-medium sm:h-11 sm:w-auto sm:px-7 sm:text-base"
            >
              <Link href="/pricing" className="text-center">
                {t('pricingBtn')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
