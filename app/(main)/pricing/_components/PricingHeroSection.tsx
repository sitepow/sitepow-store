'use client'

import { useTranslations } from 'next-intl'

import { PRICING_OPTIONS } from '@/constants/pricing'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconPackage } from '@tabler/icons-react'

import { usePricingStore } from '../store'

export function PricingHeroSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('pricing')
  const { selectedTab, setSelectedTab } = usePricingStore()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pt-6 pb-2 text-center sm:px-6 lg:px-8">
      <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-2xs">
        <IconPackage className="size-4" />
        <span>ราคาและแพ็กเกจ</span>
      </div>

      <div className="space-y-3">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {(t.raw('hero.title') as string) ||
            'เลือก Package ที่เหมาะกับ ขนาดร้านค้าและธุรกิจของคุณ'}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed text-balance sm:text-lg">
          โปร่งใส คุ้มค่า ไม่มีค่าธรรมเนียมแอบแฝง และขายฟรี 0% GP
          ตลอดอายุการใช้งาน เริ่มต้นเปิดร้านค้าได้ทันที
        </p>
      </div>

      {isMounted && (
        <div className="flex justify-center pt-4">
          <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border p-1.5 shadow-xs">
            {PRICING_OPTIONS.map((opt) => {
              const isSelected = selectedTab === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTab(opt.value)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                    isSelected
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{opt.label}</span>
                  {(opt.discountPercent ?? 0) > 0 && (
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ลด {opt.discountPercent}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
