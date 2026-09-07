'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { IconBuildingStore } from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const t = useTranslations('home.hero')
  const { isAuthenticated } = useSession()
  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden pt-12 md:pt-16"
    >
      <div className="relative flex w-full flex-col items-center justify-start px-4 sm:px-6 md:px-8">
        <div className="flex w-full max-w-4xl flex-col space-y-4 pt-6 text-center">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance wrap-break-word sm:text-5xl md:text-6xl">
            {t('titleStart')}{' '}
            <span className="from-primary bg-linear-to-r via-orange-500 to-amber-500 bg-clip-text text-transparent">
              {t('titleGradient')}
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed text-balance sm:text-base md:text-lg">
            {t('description')}
          </p>
        </div>
        <div className="mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {!isAuthenticated ? (
            <Button
              size="lg"
              asChild
              className="shadow-primary/25 h-11 w-full cursor-pointer px-6 text-sm font-semibold shadow-lg sm:w-auto sm:text-base"
            >
              <Link
                href={registerHref}
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore className="size-5" />
                <span>{t('registerBtn')}</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              asChild
              className="shadow-primary/20 h-11 cursor-pointer px-6 text-sm font-semibold shadow-md sm:w-auto sm:text-base"
            >
              <Link
                href="/merchant/dashboard"
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore className="size-5" />
                <span>{t('manageStoreBtn')}</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-11 w-full cursor-pointer px-6 text-sm font-medium sm:w-auto sm:text-base"
          >
            <Link href="/pricing" className="text-center">
              {t('pricingBtn')}
            </Link>
          </Button>
        </div>
        <div className="relative mx-auto mt-12 flex w-full max-w-5xl items-center justify-center">
          <div className="bg-background/50 ring-border relative w-full rounded-2xl border p-2 shadow-2xl ring-1 backdrop-blur-md">
            <Safari
              url="app.sitepow.store"
              className="w-full"
              videoSrc="/hero-section.webm"
            >
              <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
            </Safari>
            <BorderBeam
              size={180}
              duration={8}
              colorFrom="#f97316"
              colorTo="#3b82f6"
              borderWidth={2}
            />
          </div>
          <div className="from-background via-background/80 pointer-events-none absolute inset-x-0 -bottom-8 h-1/4 bg-linear-to-t to-transparent" />
        </div>
      </div>
    </section>
  )
}
