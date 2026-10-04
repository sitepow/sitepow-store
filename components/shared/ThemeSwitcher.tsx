'use client'

import { IconCheck, IconMoon, IconSun, IconSunMoon } from '@tabler/icons-react'
import { useTheme } from '@teispace/next-themes'
import { VariantProps } from 'class-variance-authority'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ButtonVariants = VariantProps<typeof buttonVariants>

interface ThemeSwitcherProps {
  buttonVariant?: ButtonVariants['variant']
  className?: string
}

export function ThemeSwitcher({
  buttonVariant = 'outline',
  className,
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size="icon-lg"
          className={className}
          aria-label="เปลี่ยนโหมดธีมสว่างหรือมืด"
        >
          <IconSun
            className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
            aria-hidden="true"
          />
          <IconMoon
            className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
            aria-hidden="true"
          />
          <span className="sr-only">เปลี่ยนธีม</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="cursor-pointer"
        >
          <IconSun className="mr-2 size-4" />
          <span>สว่าง</span>
          {theme === 'light' && <IconCheck className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="cursor-pointer"
        >
          <IconMoon className="mr-2 size-4" />
          <span>มืด</span>
          {theme === 'dark' && <IconCheck className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="cursor-pointer"
        >
          <IconSunMoon className="mr-2 size-4" />
          <span>ระบบ</span>
          {theme === 'system' && <IconCheck className="ml-auto size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
