'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { AVATARS_SEED } from '@/constants/avartar'
import { UserRole } from '@/generated/prisma/enums'
import { useLandingImages } from '@/hooks/use-landing-images'
import { useSession } from '@/hooks/use-session'
import { IconDownload } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { HeroHeader } from '../HeroHeader'
import { LogoBrand } from '../LogoBrand'
import { Button } from '../ui/button'

export function HeroSection() {
  const t = useTranslations('home.hero')
  const { isAuthenticated } = useSession()
  const { currentImage } = useLandingImages({ imageFolder: 'hero-section' })

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')

  const registerHref = `/register?${registerParams.toString()}`

  return (
    <section className="relative flex h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-neutral-900 px-5 pt-37.5 pb-96 text-center text-white sm:px-10">
      <div className="absolute inset-0 z-0">
        <div
          key={currentImage}
          className="animate-in fade-in absolute inset-0 size-full bg-cover bg-center opacity-40 duration-1000"
          style={{ backgroundImage: `url('${currentImage}')` }}
        />
      </div>
      <div className="z-10 space-y-5">
        <HeroHeader
          className="text-white"
          title={t('title')}
          subtitle={
            <>
              {t('subtitlePrefix')}{' '}
              <LogoBrand className="text-white" hideLogo />
            </>
          }
        />
        <div className="dark flex flex-wrap justify-center gap-2.5 px-10 text-white">
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">{t('pricingBtn')}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              <IconDownload />
              {t('downloadPosBtn')}
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button size="lg" asChild>
              <Link href={registerHref}>
                {t('registerBtn')}
                <ArrowRight />
              </Link>
            </Button>
          )}
          {isAuthenticated && (
            <Button size="lg" asChild>
              <Link href="/merchant/dashboard">
                {t('manageStoreBtn')}
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
        <div className="absolute -bottom-10 left-1/2">
          <div className="relative md:max-w-[1890px]">
            {AVATARS_SEED.map(({ seed, left, top, size, bg, dur, delay }) => (
              <Image
                key={seed}
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}`}
                width={size}
                height={size}
                unoptimized
                alt=""
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: size,
                  height: size,
                  animation: `gentle-bounce ${dur}s ease-in-out ${delay}s infinite`,
                  transform: 'translateX(-50%)',
                }}
                className="rounded-full"
              />
            ))}
            <svg
              className="h-[50vh]"
              style={{
                animation: 'gentle-bounce 2.5s ease-in-out infinite',
                width: '150vw',
                transform: 'translateX(-50%)',
              }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="fill-primary"
                d="M0,160 
               C180,100 360,220 540,160 
               C720,100 900,220 1080,160 
               C1260,100 1380,200 1440,160 
               L1440,320 L0,320 Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
