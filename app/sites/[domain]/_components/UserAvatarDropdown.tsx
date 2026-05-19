'use client'

import { ComponentProps, Fragment } from 'react'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

import { BASE_FAVICON } from '@/constants/favicon'
import { NavigationItem } from '@/constants/navigation'
import { useSession } from '@/hooks/use-session'
import { IconLogout } from '@tabler/icons-react'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/',
      redirect: true,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar
          size="lg"
          className={cn(
            'cursor-pointer transition hover:opacity-80',
            className,
          )}
          {...props}
        >
          <AvatarImage src={BASE_FAVICON} alt="@sitepowStore" />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="truncate text-sm leading-none font-medium">
              บัญชีผู้ใช้งานของคุณ
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}{' '}
              {!user?.isEmailVerified && (
                <span className="text-orange-500">(โปรดยืนยันอีเมลของคุณ)</span>
              )}
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
