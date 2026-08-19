/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client'

import { ComponentProps } from 'react'

import { useProfile } from '@/actions/hooks/profile'
import { USER_ICON } from '@/constants/favicon'
import { formatDateTime } from '@/utils/date'
import { IconCamera } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

export function BuyerProfileAvatar({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const { data: profile, isLoading } = useProfile()

  const [firstName, ...rest] = (profile?.name ?? '').split(' ')
  const lastName = rest.join(' ')

  return (
    <Card
      className={cn('h-fit overflow-hidden text-center', className)}
      {...props}
    >
      <CardContent className="relative flex flex-col items-center">
        <div className="group relative">
          <img
            src={USER_ICON}
            className="border-background bg-muted text-muted-foreground flex size-24 items-center justify-center overflow-hidden rounded-full"
          />
          <Button size="icon-lg" className="absolute right-0 bottom-0">
            <IconCamera size={14} />
          </Button>
        </div>
        {isLoading ? (
          <div className="mt-2 flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ) : (
          <>
            <h2 className="mt-2 text-base font-bold">
              {firstName} {lastName}
            </h2>
            <p className="text-muted-foreground text-xs">{profile?.id}</p>
            <p className="text-muted-foreground text-xs">{profile?.email}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t text-xs">
        <span>เป็นสมาชิกตั้งแต่</span>
        {isLoading ? (
          <Skeleton className="h-3 w-20" />
        ) : (
          <span>
            {profile?.createdAt
              ? formatDateTime(new Date(profile.createdAt))
              : '-'}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
