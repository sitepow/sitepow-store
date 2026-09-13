'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { setUserLocale } from '@/actions/locale'
import { ALL_CURRENCIES } from '@/constants/currencies'
import { LANGUAGE_NAMES, SUPPORTED_LNGS } from '@/constants/system'
import { CurrencyCode } from '@/generated/prisma/enums'
import { useCurrencyStore } from '@/stores/use-currency-store'
import {
  IconCheck,
  IconCoins,
  IconLanguage,
  IconMoon,
  IconSettings,
  IconSun,
  IconSunMoon,
} from '@tabler/icons-react'
import { useTheme } from '@teispace/next-themes'
import { VariantProps } from 'class-variance-authority'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ButtonVariants = VariantProps<typeof buttonVariants>

interface QuickSettingsMenuProps {
  buttonVariant?: ButtonVariants['variant']
}

export function QuickSettingsMenu({
  buttonVariant = 'outline',
}: QuickSettingsMenuProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const currentLocale = useLocale()
  const t = useTranslations('common.settings')
  const { currency: currentCurrency, setCurrency } = useCurrencyStore()

  const switchLocale = async (locale: string) => {
    if (currentLocale === locale) {
      return
    }

    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
    await setUserLocale(locale)
    router.refresh()
  }

  const switchCurrency = (currencyCode: CurrencyCode) => {
    setCurrency(currencyCode)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size="icon-lg">
          <IconSettings className="size-[1.2rem]" />
          <span className="sr-only">Quick Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t('title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconSunMoon className="mr-2 size-4" />
            <span>{t('theme')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <IconSun className="mr-2 size-4" />
                <span>{t('light')}</span>
                {theme === 'light' && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <IconMoon className="mr-2 size-4" />
                <span>{t('dark')}</span>
                {theme === 'dark' && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <IconSunMoon className="mr-2 size-4" />
                <span>{t('system')}</span>
                {theme === 'system' && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconLanguage className="mr-2 size-4" />
            <span>{t('language')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {SUPPORTED_LNGS.map((lng) => (
                <DropdownMenuItem key={lng} onClick={() => switchLocale(lng)}>
                  <span>{LANGUAGE_NAMES[lng] || lng}</span>
                  {currentLocale === lng && (
                    <IconCheck className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconCoins className="mr-2 size-4" />
            <span>{t('currency')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
              {ALL_CURRENCIES.map((curr) => (
                <DropdownMenuItem
                  key={curr.code}
                  onClick={() => switchCurrency(curr.code)}
                >
                  <span className="mr-1.5">{curr.flag}</span>
                  <span className="font-medium">{curr.code}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">
                    ({curr.symbol})
                  </span>
                  {currentCurrency === curr.code && (
                    <IconCheck className="ml-auto size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
