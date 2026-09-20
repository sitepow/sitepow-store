'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { IconChevronRight } from '@tabler/icons-react'

import { getManageUrl } from '@/lib/manage-url'

export interface CtaSectionProps {
  title?: string
  description?: string
  registerBtn?: string
  dashboardBtn?: string
}

export function CtaSection({
  title,
  registerBtn,
  dashboardBtn,
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
  const resolvedRegisterBtn = registerBtn ?? t('registerBtn')
  const resolvedDashboardBtn = dashboardBtn ?? t('dashboardBtn')

  const ctaHref = isAuth ? getManageUrl('/merchant/dashboard') : registerHref
  const ctaLabel = isAuth ? resolvedDashboardBtn : resolvedRegisterBtn

  return (
    <div className="from-primary via-primary/90 relative mt-24 w-full overflow-hidden bg-linear-to-r to-sky-500 py-10 text-white sm:mt-32 sm:py-14">
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-base font-semibold text-white sm:text-lg md:text-2xl">
          {resolvedTitle}
        </p>

        <Link
          href={ctaHref}
          className="inline-flex h-10 items-center justify-center rounded-full bg-orange-500 px-8 text-xs font-semibold text-white shadow-md transition-colors hover:bg-orange-600 sm:h-11 sm:text-sm"
        >
          <span>{ctaLabel}</span>
          <IconChevronRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  )
}
