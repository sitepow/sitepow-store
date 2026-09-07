'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  PRICING_OPTIONS,
  PRICING_PLANS,
  PRICING_VALUE,
} from '@/constants/pricing'
import { UserRole } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { calculatePlanPrice } from '@/utils/pricing'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'

export function PricingSection() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    PRICING_VALUE.TWELVE_MONTHS,
  )
  const { isAuthenticated } = useSession()
  const t = useTranslations('pricing')

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`

  const plans = PRICING_PLANS.map((plan, idx) => {
    let title = plan.title
    let description = plan.description
    let buttonText = plan.buttonText
    let uniqueFeatures = plan.uniqueFeatures

    try {
      title = (t.raw(`plans.${idx}.title`) as string) || plan.title
      description =
        (t.raw(`plans.${idx}.description`) as string) || plan.description
      buttonText =
        (t.raw(`plans.${idx}.buttonText`) as string) || plan.buttonText
      uniqueFeatures = plan.uniqueFeatures.map((feature, fIdx) => ({
        ...feature,
        text:
          (t.raw(`plans.${idx}.features.${fIdx}`) as string) || feature.text,
      }))
    } catch {}

    return {
      ...plan,
      title,
      description,
      buttonText,
      uniqueFeatures,
    }
  })

  const currentOption =
    PRICING_OPTIONS.find((opt) => opt.value === selectedPeriod) ||
    PRICING_OPTIONS[0]

  return (
    <section id="pricing" className="relative w-full py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 pb-6 text-center">
          <h2 className="text-primary text-sm font-semibold">ราคาและแพ็กเกจ</h2>
          <h3 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            โปร่งใส คุ้มค่า ไม่มีค่าธรรมเนียมแอบแฝง และ 0% GP ตลอดอายุการใช้งาน
          </p>

          <div className="flex justify-center pt-4">
            <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border p-1.5 shadow-xs">
              {PRICING_OPTIONS.map((opt) => {
                const isSelected = selectedPeriod === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedPeriod(opt.value)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-3.5 ${
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
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, idx) => {
            const { basePrice, discountPercent, finalPrice, averagePerMonth } =
              calculatePlanPrice(plan.price, selectedPeriod)

            const targetHref = !isAuthenticated
              ? registerHref
              : '/merchant/store-settings'

            return (
              <Card
                key={idx}
                className={`relative flex flex-col justify-between overflow-visible rounded-3xl p-5 transition-all duration-300 sm:p-6 ${
                  plan.isPopular
                    ? 'border-primary bg-card ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
                    : 'border-border/80 bg-card/60 border hover:shadow-md'
                }`}
              >
                {plan.isPopular && (
                  <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold shadow-sm">
                    แนะนำมากที่สุด
                  </div>
                )}

                <div>
                  <CardHeader className="space-y-2 p-0">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xl font-bold">
                        {plan.title}
                      </span>
                      {basePrice === 0 && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                          ฟรีตลอดชีพ
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      {discountPercent > 0 && basePrice > 0 && (
                        <span className="text-muted-foreground text-xs line-through">
                          ฿{basePrice.toLocaleString()} / เดือน
                        </span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-foreground text-3xl font-extrabold sm:text-4xl">
                          {basePrice === 0
                            ? '฿0'
                            : `฿${Math.round(averagePerMonth).toLocaleString()}`}
                        </span>
                        <span className="text-muted-foreground text-xs font-medium">
                          {basePrice === 0 ? '/ ตลอดชีพ' : '/ เดือน'}
                        </span>
                      </div>
                      {basePrice > 0 &&
                        selectedPeriod !== PRICING_VALUE.ONE_MONTH && (
                          <p className="text-muted-foreground pt-1 text-[11px]">
                            ชำระรวม ฿{Math.round(finalPrice).toLocaleString()} (
                            {currentOption.label})
                          </p>
                        )}
                    </div>

                    <p className="text-muted-foreground min-h-9 pt-2 text-xs leading-relaxed">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <div className="border-border/60 my-5 border-t" />

                  <ul className="text-foreground space-y-3 text-xs sm:text-sm">
                    {plan.uniqueFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <div
                          className="text-primary mt-0.5 shrink-0"
                          aria-hidden="true"
                        >
                          {feat.icon}
                        </div>
                        <span className="text-xs leading-snug sm:text-sm">
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <CardFooter className="p-0 pt-6">
                  <Button
                    asChild
                    variant={plan.isPopular ? 'default' : 'outline'}
                    className="h-10 w-full cursor-pointer text-xs font-semibold sm:text-sm"
                  >
                    <Link href={targetHref}>{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <span>ดูตารางเปรียบเทียบฟีเจอร์ทุกแพ็กเกจอย่างละเอียด</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
