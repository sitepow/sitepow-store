import { ComponentProps } from 'react'

import { IconCalendarTime, IconCamera } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface BuyerProfileAvatarProps extends ComponentProps<typeof Card> {
  firstName: string
  lastName: string
  email: string
  joinedDate: string
}

export function BuyerProfileAvatar({
  firstName,
  lastName,
  email,
  joinedDate,
  className,
  ...props
}: BuyerProfileAvatarProps) {
  return (
    <Card className={cn('h-fit text-center', className)} {...props}>
      <CardContent className="relative flex flex-col items-center">
        <div className="group relative">
          <div className="border-background bg-muted text-muted-foreground flex size-24 items-center justify-center overflow-hidden rounded-full text-xl font-bold">
            <span>{firstName[0]}</span>
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
          <IconCalendarTime size={14} /> วันที่เริ่มใช้งาน:
        </span>
        <span>{joinedDate}</span>
      </CardFooter>
    </Card>
  )
}
