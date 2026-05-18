import { ComponentProps } from 'react'

import { formatDate } from '@/utils/date'
import { IconCamera, IconUser } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface ProfileAvartarProps extends ComponentProps<typeof Card> {
  firstName: string
  lastName: string
  email: string
  joinedDate: Date
}

export function ProfileAvartar({
  firstName,
  lastName,
  email,
  joinedDate,
  className,
  ...props
}: ProfileAvartarProps) {
  return (
    <Card
      className={cn('h-fit overflow-hidden text-center', className)}
      {...props}
    >
      <div className="from-primary/20 to-primary/5 -mt-8 h-32 bg-linear-to-r" />
      <CardContent className="relative flex flex-col items-center">
        <div className="group relative">
          <div className="border-background bg-muted text-muted-foreground flex size-24 items-center justify-center overflow-hidden rounded-full">
            <IconUser />
          </div>
          <Button size="icon-lg" className="absolute right-0 bottom-0">
            <IconCamera size={14} />
          </Button>
        </div>
        <h2 className="mt-2 text-base font-bold">
          {firstName} {lastName}
        </h2>
        <p className="text-muted-foreground text-xs">{email}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t text-xs">
        <span>เป็นสมาชิกตั้งแต่:</span>
        <b>{formatDate(joinedDate)}</b>
      </CardFooter>
    </Card>
  )
}
