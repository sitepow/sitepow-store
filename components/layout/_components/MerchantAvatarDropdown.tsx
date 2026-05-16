'use client'

import { ComponentProps } from 'react'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

import { BASE_FAVICON } from '@/constants/favicon'
import { useSession } from '@/hooks/use-session'
import {
  IconBuildingStore,
  IconCoin,
  IconCreditCard,
  IconHierarchy2,
  IconHistory,
  IconLayoutDashboard,
  IconLogout,
  IconSettings,
  IconSparkles,
  IconTicket,
  IconUser,
} from '@tabler/icons-react'

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

        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconLayoutDashboard className="mr-2 stroke-[1.5]" /> แดชบอร์ด
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconUser className="mr-2 stroke-[1.5]" /> โปรไฟล์ส่วนตัว
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconBuildingStore className="mr-2 stroke-[1.5]" /> ข้อมูลร้านค้า
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconCreditCard className="mr-2 stroke-[1.5]" /> การสมัครสมาชิก
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconSparkles className="mr-2 stroke-[1.5]" /> เครดิต AI
            (Vision/Search)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconCoin className="mr-2 stroke-[1.5]" /> ระบบแต้มสะสม
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconTicket className="mr-2 stroke-[1.5]" /> คูปองส่วนลด
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconHierarchy2 className="mr-2 stroke-[1.5]" /> จัดการสาขา
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconHistory className="mr-2 stroke-[1.5]" /> ประวัติกิจกรรม
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconSettings className="mr-2 stroke-[1.5]" /> ตั้งค่าระบบ
          </Link>
        </DropdownMenuItem>

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
