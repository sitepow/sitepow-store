'use client'

import { useTranslations } from 'next-intl'

import {
  IconBarcode,
  IconBrandMastercard,
  IconBrandStripe,
  IconBuildingBank,
  IconDevices,
  IconPackage,
  IconPrinter,
  IconQrcode,
  IconShieldCheck,
  IconTruck,
  IconWorld,
} from '@tabler/icons-react'

import { Marquee } from '@/components/magicui/marquee'

const INTEGRATION_ITEMS = [
  {
    name: 'PromptPay QR',
    category: 'Instant Payment',
    icon: IconQrcode,
  },
  {
    name: 'Stripe Payments',
    category: 'Global Gateway',
    icon: IconBrandStripe,
  },
  {
    name: 'Visa & Mastercard',
    category: 'Credit / Debit',
    icon: IconBrandMastercard,
  },
  {
    name: 'Thai Bank Transfer',
    category: 'Direct Transfer',
    icon: IconBuildingBank,
  },

  {
    name: 'Flash Express',
    category: 'Courier Logistics',
    icon: IconTruck,
  },
  {
    name: 'Thailand Post EMS',
    category: 'Postal Service',
    icon: IconPackage,
  },
  {
    name: 'Kerry Express',
    category: 'Express Delivery',
    icon: IconTruck,
  },
  {
    name: 'Worldwide Shipping',
    category: 'Global Zones',
    icon: IconWorld,
  },

  {
    name: 'Thermal Printers',
    category: 'ESC/POS 80mm & 58mm',
    icon: IconPrinter,
  },
  {
    name: 'Barcode Scanners',
    category: 'USB / Bluetooth HID',
    icon: IconBarcode,
  },
  {
    name: 'Cross-Platform',
    category: 'PC, Mac, iPad, Android',
    icon: IconDevices,
  },
  {
    name: 'SSL 256-bit',
    category: 'Bank-Grade Security',
    icon: IconShieldCheck,
  },
]

export interface LogosSectionProps {
  title?: string
}

export function LogosSection({ title }: LogosSectionProps = {}) {
  const t = useTranslations('home.logos')
  const resolvedTitle = title ?? t('title')

  return (
    <section
      id="logos"
      className="border-border/40 relative w-full border-b py-10 sm:py-12"
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <p className="text-muted-foreground text-center text-xs font-medium tracking-wider uppercase">
          {resolvedTitle ||
            'Seamlessly Integrated with Leading Platforms & Hardware'}
        </p>

        <div className="relative mt-6 overflow-hidden">
          <Marquee pauseOnHover className="[--duration:40s] [--gap:1rem]">
            {INTEGRATION_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-card/50 hover:bg-card/80 border-border/70 text-foreground flex items-center gap-3 rounded-xl border px-3.5 py-2 shadow-2xs backdrop-blur-xs transition-colors"
              >
                <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
                  <item.icon size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs leading-tight font-semibold">
                    {item.name}
                  </span>
                  <span className="text-muted-foreground text-[10px] leading-tight">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </Marquee>

          <div className="from-background pointer-events-none absolute inset-y-0 left-0 h-full w-16 bg-linear-to-r to-transparent sm:w-28" />
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 h-full w-16 bg-linear-to-l to-transparent sm:w-28" />
        </div>
      </div>
    </section>
  )
}
