'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { QuickSettingsMenu } from '@/components/QuickSettingsMenu'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

interface DesktopGuestActionsProps {
  loginHref: string
  registerHref: string
}

export function DesktopGuestActions({
  loginHref,
  registerHref,
}: DesktopGuestActionsProps) {
  const t = useTranslations('common.navbar')

  return (
    <>
      <Link href={loginHref}>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground font-medium"
        >
          {t('login')}
        </Button>
      </Link>
      <Link href={registerHref}>
        <RainbowButton size="sm" className="font-medium">
          {t('register')}
        </RainbowButton>
      </Link>
      <QuickSettingsMenu buttonVariant="ghost" />
    </>
  )
}
