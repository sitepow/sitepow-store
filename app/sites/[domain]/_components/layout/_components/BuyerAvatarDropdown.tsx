'use client'

import { ComponentProps } from 'react'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

import { BASE_FAVICON } from '@/constants/favicon'
import { useSession } from '@/hooks/use-session'
import {
  IconCoin,
  IconHeart,
  IconHistory,
  IconLogout,
  IconMapPin,
  IconPackage,
  IconSettings,
  IconTicket,
  IconUser,
  IconWallet,
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

type BuyerAvatarDropdownProps = ComponentProps<typeof Avatar>

export function BuyerAvatarDropdown({
  className,
  ...props
}: BuyerAvatarDropdownProps) {
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

        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconPackage className="mr-2 stroke-[1.5]" /> การซื้อของฉัน
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconUser className="mr-2 stroke-[1.5]" /> โปรไฟล์ส่วนตัว
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconMapPin className="mr-2 stroke-[1.5]" /> ที่อยู่จัดส่ง
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconWallet className="mr-2 stroke-[1.5]" /> กระเป๋าเงิน /
            ช่องทางชำระเงิน
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconCoin className="mr-2 stroke-[1.5]" /> แต้มสะสมของฉัน
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconTicket className="mr-2 stroke-[1.5]" /> โค้ดส่วนลดของฉัน
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconHeart className="mr-2 stroke-[1.5]" /> สินค้าที่ถูกใจ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconHistory className="mr-2 stroke-[1.5]" /> สินค้าที่ดูเมื่อเร็วๆ
            นี้
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="" className="flex w-full cursor-pointer items-center">
            <IconSettings className="mr-2 stroke-[1.5]" /> ตั้งค่าบัญชี
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
