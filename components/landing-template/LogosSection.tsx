'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import {
  IconBolt,
  IconBrandMastercard,
  IconBrandStripe,
  IconCoins,
  IconDeviceMobile,
  IconPackage,
  IconQrcode,
  IconRobot,
  IconShieldCheck,
  IconTruck,
  IconWorld,
} from '@tabler/icons-react'

import { Marquee } from '@/components/magicui/marquee'

import { gsap } from '@/lib/gsap'

const LOGO_ITEMS = [
  { name: 'PromptPay QR', icon: IconQrcode, note: 'PromptPay QR' },
  {
    name: 'Stripe Payments',
    icon: IconBrandStripe,
    note: 'Credit / Debit Cards',
  },
  {
    name: 'AI Slip Verification',
    icon: IconRobot,
    note: 'AI Slip Verification',
  },
  {
    name: 'Visa & Mastercard',
    icon: IconBrandMastercard,
    note: 'Visa & Mastercard',
  },
  { name: '0% GP Commission', icon: IconBolt, note: '0% GP Commission' },
  { name: 'Flash Express', icon: IconTruck, note: 'Flash Express' },
  { name: 'Kerry Express', icon: IconPackage, note: 'Kerry Express' },
  { name: 'Thailand Post', icon: IconTruck, note: 'Thailand Post EMS' },
  {
    name: 'Worldwide Shipping',
    icon: IconWorld,
    note: 'Worldwide Zone Rates',
  },
  {
    name: 'Multi-Currency',
    icon: IconCoins,
    note: 'THB, USD, EUR, JPY',
  },
  {
    name: 'Digital Key Codes',
    icon: IconDeviceMobile,
    note: 'Digital Goods & Keys',
  },
  {
    name: 'SSL Security',
    icon: IconShieldCheck,
    note: 'SSL Encryption 256-bit',
  },
]

export interface LogosSectionProps {
  title?: string
}

export function LogosSection({ title }: LogosSectionProps = {}) {
  const t = useTranslations('home.logos')
  const sectionRef = useRef<HTMLElement>(null)
  const resolvedTitle = title ?? t('title')

  useGSAP(
    () => {
      if (sectionRef.current) {
        gsap.from(sectionRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        })
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="logos"
      className="border-border/40 relative w-full border-b py-12"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <h3 className="text-muted-foreground text-center text-xs font-semibold">
          {resolvedTitle}
        </h3>
        <div className="relative mt-6">
          <Marquee pauseOnHover className="[--duration:35s] [--gap:1.5rem]">
            {LOGO_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-card/60 text-card-foreground hover:bg-card flex items-center gap-2.5 rounded-xl border px-4 py-2 shadow-xs transition-colors"
              >
                <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
                  <item.icon size={16} />
                </div>
                <div>
                  <div className="text-xs leading-none font-semibold">
                    {item.name}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {item.note}
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-24 bg-gradient-to-r to-transparent md:w-36" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-24 bg-gradient-to-l to-transparent md:w-36" />
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-12 bg-gradient-to-r to-transparent sm:w-24 md:w-36" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-12 bg-gradient-to-l to-transparent sm:w-24 md:w-36" />
        </div>
      </div>
    </section>
  )
}
