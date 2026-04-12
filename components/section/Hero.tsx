import Image from 'next/image'
import Link from 'next/link'

import { LogoBrand } from '../LogoBrand'
import { Button } from '../ui/button'

const AVATARS = [
  {
    seed: 'Zephyr',
    left: '-7%',
    top: 60,
    size: 72,
    bg: 'b6e3f4',
    dur: 3.2,
    delay: 0.0,
  },
  {
    seed: 'Luna',
    left: '14%',
    top: 20,
    size: 52,
    bg: 'c0aede',
    dur: 2.9,
    delay: 0.5,
  },
  {
    seed: 'Orion',
    left: '-3%',
    top: 45,
    size: 80,
    bg: 'd1d4f9',
    dur: 3.5,
    delay: 0.3,
  },
  {
    seed: 'Stella',
    left: '19%',
    top: 15,
    size: 56,
    bg: 'ffd5dc',
    dur: 2.7,
    delay: 0.9,
  },
  {
    seed: 'Nova',
    left: '6%',
    top: 50,
    size: 68,
    bg: 'ffdfbf',
    dur: 3.1,
    delay: 0.2,
  },
  {
    seed: 'Atlas',
    left: '-15%',
    top: 22,
    size: 58,
    bg: 'c0aede',
    dur: 3.6,
    delay: 0.7,
  },
  {
    seed: 'Aura',
    left: '11%',
    top: 48,
    size: 76,
    bg: 'b6e3f4',
    dur: 2.8,
    delay: 0.4,
  },
  {
    seed: 'Blaze',
    left: '-9%',
    top: 18,
    size: 54,
    bg: 'ffd5dc',
    dur: 3.3,
    delay: 1.0,
  },
  {
    seed: 'Cleo',
    left: '3%',
    top: 40,
    size: 64,
    bg: 'd1d4f9',
    dur: 3.0,
    delay: 0.6,
  },
]

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-5 overflow-hidden pt-20 pb-96 text-center">
      <h1 className="max-w-2xl text-4xl leading-tight font-bold">
        เปลี่ยนเรื่องยุ่ง ๆ ให้เป็นเรื่องง่าย ของการขายสินค้าออนไลน์
      </h1>
      <h2 className="flex flex-wrap items-center gap-2.5">
        <span className="max-w-2xl text-2xl font-medium opacity-70">
          ด้วยระบบจัดการร้านค้าออนไลน์ จาก{' '}
        </span>
        <LogoBrand />
      </h2>

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

      <div className="absolute -bottom-10 left-1/2">
        <div className="relative">
          {AVATARS.map(({ seed, left, top, size, bg, dur, delay }) => (
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
