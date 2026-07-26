/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client'

import { ComponentProps, useEffect, useMemo, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useProfile } from '@/actions/hooks/profile'
import { BASE_FAVICON } from '@/constants/favicon'
import { formatDateTime } from '@/utils/date'
import { IconCamera } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

export function ProfileAvartar({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const { data: profile, isLoading } = useProfile()

  const { setValue, control } = useFormContext()

  const firstName = useWatch({ control, name: 'firstName' })
  const lastName = useWatch({ control, name: 'lastName' })
  const fullName = `${firstName} ${lastName}`
  const image = useWatch({ control, name: 'image' })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(() => {
    if (image instanceof File) {
      return URL.createObjectURL(image)
    }

    return image || profile?.image || BASE_FAVICON
  }, [image, profile?.image])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Card
      className={cn('h-fit overflow-hidden text-center', className)}
      {...props}
    >
      <CardContent className="relative flex flex-col items-center">
        <div className="group relative">
          <img
            src={previewUrl}
            className="border-background bg-muted text-muted-foreground flex size-24 items-center justify-center overflow-hidden rounded-full object-cover"
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setValue('image', file, { shouldDirty: true })
              }
            }}
          />
          <Button
            size="icon-lg"
            className="absolute right-0 bottom-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconCamera size={14} />
          </Button>
        </div>
        {isLoading ? (
          <div className="mt-2 flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ) : (
          <div className="mt-2">
            <h2 className="text-base font-bold">{fullName || profile?.name}</h2>
            <p className="text-muted-foreground text-xs">{profile?.id}</p>
            <p className="text-muted-foreground text-xs">{profile?.email}</p>
          </div>
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
