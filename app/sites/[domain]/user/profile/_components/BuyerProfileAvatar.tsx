import { ComponentProps } from 'react'

import { formatDate } from '@/utils/date'
import { IconCalendarTime, IconCamera, IconUser } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface BuyerProfileAvatarProps extends ComponentProps<typeof Card> {
  firstName: string
  lastName: string
  email: string
}

export function BuyerProfileAvatar({
  firstName,
  lastName,
  email,
  className,
  ...props
}: BuyerProfileAvatarProps) {
  return (
    <Card className={cn('h-fit text-center', className)} {...props}>
      <CardContent className="relative flex flex-col items-center">
        <div className="group relative">
          <div className="border-background bg-muted text-muted-foreground flex size-24 items-center justify-center overflow-hidden rounded-full text-xl font-bold">
            <IconUser />
          </div>
          <Button size="icon-lg" className="absolute right-0 bottom-0">
            <IconCamera size={14} />
          </Button>
        </div>
        <h3 className="mt-2 text-base font-bold">
          {firstName} {lastName}
        </h3>
        <p className="text-muted-foreground text-xs">{email}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <IconCalendarTime size={14} /> วันที่เริ่มใช้งาน
        </span>
        <span>{formatDate(new Date())}</span>
      </CardFooter>
    </Card>
  )
}
