'use client'

import Image from 'next/image'
import Link from 'next/link'

import { AVATARS_SEED } from '@/constants/avartar'
import { useSession } from '@/hooks/use-session'

import { HeroHeader } from '../HeroHeader'
import { LogoBrand } from '../LogoBrand'
import { Button } from '../ui/button'

export function HeroSection() {
  const { isAuthenticated } = useSession()

  return (
    <section className="relative flex flex-col items-center justify-center gap-5 overflow-hidden pt-20 pb-96 text-center">
      <HeroHeader
        title="เปลี่ยนเรื่องยุ่ง ๆ ให้เป็นเรื่องง่าย ของการขายสินค้าออนไลน์"
        subtitle={
          <>
            ด้วยระบบจัดการร้านค้าออนไลน์ จาก <LogoBrand />
          </>
        }
      />

      {!isAuthenticated && (
        <div className="flex gap-2.5">
          <Link href="/register">
            <Button size="lg">สมัครเปิดร้าน</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary" size="lg">
              ดูราคา
            </Button>
          </Link>
        </div>
      )}

      <div className="absolute -bottom-10 left-1/2">
        <div className="relative">
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
              className="rounded-full border-2 border-white/70 bg-white shadow-md"
            />
          ))}

          <svg
            style={{
              animation: 'gentle-bounce 2.5s ease-in-out infinite',
              width: '150vw',
              height: '375px',
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
    </section>
  )
}
