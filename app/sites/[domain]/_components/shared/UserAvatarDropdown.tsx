'use client'

import { ComponentProps, Fragment } from 'react'

import Link from 'next/link'

import { USER_ICON } from '@/constants/shared/assets'
import { NavigationItem } from '@/constants/store/navigation'
import { useSession } from '@/hooks/use-session'
import {
  IconCheck,
  IconLogout,
  IconMoon,
  IconSun,
  IconSunMoon,
} from '@tabler/icons-react'
import { useTheme } from '@teispace/next-themes'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

interface UserAvatarDropdownProps extends ComponentProps<typeof Avatar> {
  items: NavigationItem[]
  redirectPath: string
}

export function UserAvatarDropdown({
  className,
  items,
  redirectPath,
  ...props
}: UserAvatarDropdownProps) {
  const { user } = useSession()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    const isCentralDomain =
      window.location.hostname.endsWith('sitepow.store') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === 'lvh.me'

    if (!isCentralDomain) {
      await fetch('/api/auth/custom-logout', { method: 'POST' })
      window.location.href = '/login'
      return
    }

    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none"
        aria-label="เมนูผู้ใช้งาน"
      >
        <Avatar
          size="lg"
          className={cn(
            'cursor-pointer transition hover:opacity-80',
            className,
          )}
          {...props}
        >
          <AvatarImage
            src={user?.image || USER_ICON}
            alt={user?.email || 'sitepowStore'}
          />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="truncate text-sm leading-none font-medium">
              บัญชีผู้ใช้งานของคุณ
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Fragment key={item.value}>
              {item.hasSeparatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem asChild>
                <Link
                  href={`/${redirectPath}/${item.value}`}
                  className="flex w-full cursor-pointer items-center"
                >
                  <Icon className="mr-2 stroke-[1.5]" size={18} />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            </Fragment>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <IconSunMoon className="mr-2 stroke-[1.5]" size={18} />
            <span>ธีม</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
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
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={handleLogout}
        >
          <IconLogout className="mr-2 stroke-[1.5]" size={18} /> ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
