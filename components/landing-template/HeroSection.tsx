'use client'

import { useRef, useState } from 'react'

import Link from 'next/link'

import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import {
  IconArrowRight,
  IconBuildingStore,
  IconDeviceLaptop,
  IconPlayerPlayFilled,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { getManageUrl } from '@/lib/manage-url'

const REGISTER_HREF = `/register?role=${UserRole.MERCHANT}&callbackUrl=%2Fmerchant%2Fdashboard`

export interface HeroSectionProps {
  badge: { new: string; text: string }
  title: { start: string; gradient: string }
  description: string
  buttons: {
    register: string
    manageStore: string
    downloadPos: string
  }
}

export function HeroSection({ title, description, buttons }: HeroSectionProps) {
  const { isAuthenticated } = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayToggle = () => {
    if (!videoRef.current) {
      return
    }

    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <section
      id="hero"
      className="from-primary via-primary/90 relative flex w-full items-center overflow-hidden bg-linear-to-r to-sky-500 py-14 text-white sm:py-16 md:py-20"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 md:flex-row md:px-8 lg:px-12">
        <div className="flex max-w-2xl flex-col items-start space-y-3 text-left sm:space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {title.start}{' '}
            <span className="font-semibold text-white/95">
              “{title.gradient}”
            </span>
          </h1>

          <p className="max-w-xl text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
            {description}
          </p>

          <div className="flex w-full flex-col items-stretch justify-start gap-3 pt-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              size="default"
              asChild
              className="h-10 bg-orange-500 px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 sm:h-11"
            >
              <Link
                href={
                  isAuthenticated
                    ? getManageUrl('/merchant/dashboard')
                    : REGISTER_HREF
                }
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore className="size-4" />
                <span>
                  {isAuthenticated ? buttons.manageStore : buttons.register}
                </span>
                <IconArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="default"
              asChild
              className="h-10 border-white/30 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white sm:h-11"
            >
              <Link
                href="/download-pos"
                className="flex items-center justify-center gap-2"
              >
                <IconDeviceLaptop className="size-4 text-white/90" />
                <span>{buttons.downloadPos}</span>
              </Link>
            </Button>
          </div>
        </div>

        <div
          onClick={handlePlayToggle}
          className="relative aspect-video w-full max-w-md shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-xl"
        >
          <video
            ref={videoRef}
            src="/hero-section.mp4"
            className="h-full w-full object-cover"
            playsInline
            controls={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {!isPlaying && (
            <>
              <div className="absolute inset-0 bg-black/20" />
              <button
                type="button"
                aria-label="Play video"
                className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-110"
              >
                <IconPlayerPlayFilled className="ml-1 size-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
