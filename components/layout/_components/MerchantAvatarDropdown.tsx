'use client'

import { ComponentProps, Fragment } from 'react'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

import { BASE_FAVICON } from '@/constants/favicon'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
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

type MerchantAvatarDropdownProps = ComponentProps<typeof Avatar>

export function MerchantAvatarDropdown({
  className,
  ...props
}: MerchantAvatarDropdownProps) {
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
            <p className="text-sm leading-none font-medium">ร้านค้าของคุณ</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email}{' '}
              {!user?.isEmailVerified && (
                <span className="text-orange-500">(โปรดยืนยันอีเมลของคุณ)</span>
              )}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {MERCHANT_NAVIGATION.map((item) => {
          const Icon = item.icon

          return (
            <Fragment key={item.value}>
              {item.hasSeparatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem asChild>
                <Link
                  href={`/merchant/${item.tab}`}
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
          <IconLogout className="mr-2 stroke-[1.5]" /> ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
