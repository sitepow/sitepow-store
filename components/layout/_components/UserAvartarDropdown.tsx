import { ComponentProps } from 'react'

import { signOut } from 'next-auth/react'

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

type UserAvartarDropdownProps = ComponentProps<typeof Avatar>

export function UserAvartarDropdown({
  className,
  ...props
}: UserAvartarDropdownProps) {
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
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <IconLayoutDashboard className="mr-2 stroke-[1.5]" /> แดชบอร์ด
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconUser className="mr-2 stroke-[1.5]" /> โปรไฟล์ส่วนตัว
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconBuildingStore className="mr-2 stroke-[1.5]" />
          ข้อมูลร้านค้า
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <IconCreditCard className="mr-2 stroke-[1.5]" />
          การสมัครสมาชิก
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconSparkles className="mr-2 stroke-[1.5]" /> เครดิต AI
          (Vision/Search)
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconCoin className="mr-2 stroke-[1.5]" /> ระบบแต้มสะสม
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconTicket className="mr-2 stroke-[1.5]" /> คูปองส่วนลด
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <IconHierarchy2 className="mr-2 stroke-[1.5]" /> จัดการสาขา
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconHistory className="mr-2 stroke-[1.5]" /> ประวัติกิจกรรม
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconSettings className="mr-2 stroke-[1.5]" /> ตั้งค่าระบบ
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
