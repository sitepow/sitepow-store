'use client'

import { usePathname } from 'next/navigation'

import { LANGUAGE_NAMES, SUPPORTED_LNGS } from '@/constants/system'
import {
  IconCheck,
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
  const pathname = usePathname()
  // const router = useRouter()

  const currentLocale = pathname.split('/')[1]

  //   const switchLocale = (locale: string) => {
  //     if (currentLocale === locale) {
  //       return
  //     }

  //     const segments = pathname.split('/')
  //     segments[1] = locale
  //     router.push(segments.join('/'))
  //   }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size="icon-lg"
          aria-label="ตั้งค่าทั่วไปและเปลี่ยนธีม"
        >
          <IconSettings className="size-[1.2rem]" aria-hidden="true" />
          <span className="sr-only">Quick Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>ตั้งค่าทั่วไป</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconSunMoon className="mr-2 size-4" />
            <span>ธีมเว็บไซต์</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <IconSun className="mr-2 size-4" />
                <span>สว่าง</span>
                {theme === 'light' && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <IconMoon className="mr-2 size-4" />
                <span>มืด</span>
                {theme === 'dark' && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <IconSunMoon className="mr-2 size-4" />
                <span>ระบบ</span>
                {theme === 'system' && <IconCheck className="ml-auto size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconLanguage className="mr-2 size-4" />
            <span>ภาษา</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {SUPPORTED_LNGS.map((lng) => (
                <DropdownMenuItem
                  key={lng}
                  // onClick={() => switchLocale(lng)}
                >
                  <span>{LANGUAGE_NAMES[lng] || lng}</span>
                  {currentLocale === lng && (
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
