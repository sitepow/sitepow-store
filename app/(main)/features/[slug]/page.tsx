import { Suspense } from 'react'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FEATURES_DATA } from '@/constants/features'
import { UserRole } from '@/generated/prisma/enums'
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
  IconHelpCircle,
  IconSparkles,
  IconX,
} from '@tabler/icons-react'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

interface FeaturePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return FEATURES_DATA.map((feature) => ({
    slug: feature.slug,
  }))
}

export async function generateMetadata({
  params,
}: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params
  const feature = FEATURES_DATA.find((f) => f.slug === slug)

  if (!feature) {
    return {
      title: 'ฟีเจอร์ไม่พบ | Sitepow Store',
    }
  }

  return {
    title: `${feature.title} | ฟังก์ชันระบบ Sitepow Store`,
    description: feature.shortDescription,
    alternates: {
      canonical: `/features/${feature.slug}`,
      languages: {
        th: `/features/${feature.slug}?lang=th`,
        en: `/features/${feature.slug}?lang=en`,
      },
    },
    openGraph: {
      title: `${feature.title} | Sitepow Store`,
      description: feature.shortDescription,
    },
  }
}

export default async function FeatureDetailPage({ params }: FeaturePageProps) {
  const { slug } = await params
  const feature = FEATURES_DATA.find((f) => f.slug === slug)

  if (!feature) {
    notFound()
  }

  const relatedFeatures = FEATURES_DATA.filter(
    (f) => f.slug !== feature.slug,
  ).slice(0, 3)

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`

  return (
    <MainLayout className="flex flex-col items-center gap-16 overflow-hidden pt-4 pb-12 md:gap-24">
      <Suspense>
        {/* 1. Feature Hero Section */}
        <div className="relative mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-4 text-center sm:px-6 lg:px-8">
          {/* Subtle Ambient Radial Glow */}
          <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

          {/* Breadcrumb & Category Badge */}
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
            <Link
              href="/features"
              className="hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <IconArrowLeft size={14} />
              <span>ฟังก์ชันทั้งหมด</span>
            </Link>
            <IconChevronRight size={12} />
            <span className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2.5 py-0.5 font-semibold">
              {feature.categoryLabel}
            </span>
          </div>

          {/* Icon & Headline */}
          <div className="space-y-4">
            <div className="bg-card/80 border-border/80 shadow-primary/5 mx-auto inline-flex size-20 items-center justify-center rounded-3xl border shadow-xl backdrop-blur-md">
              {feature.icon}
            </div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
              {feature.title}
            </h1>
            <p className="text-primary text-base font-semibold sm:text-xl">
              {feature.tagline}
            </p>
            <p className="text-muted-foreground mx-auto max-w-3xl text-sm leading-relaxed text-balance sm:text-base">
              {feature.fullDescription}
            </p>
          </div>

          {/* Direct CTA Buttons */}
          <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-3 pt-2 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="shadow-primary/25 h-12 w-full cursor-pointer rounded-full px-7 text-sm font-semibold shadow-lg transition-transform hover:scale-105 sm:w-auto"
            >
              <Link
                href={registerHref}
                className="flex items-center justify-center gap-2"
              >
                <IconBuildingStore size={18} />
                <span>สมัครเปิดร้านค้าฟรี 0% GP</span>
                <IconArrowRight size={16} />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 w-full cursor-pointer rounded-full px-7 text-sm font-medium transition-all sm:w-auto"
            >
              <Link href="/pricing" className="text-center">
                ดูราคาและแพ็กเกจ
              </Link>
            </Button>
          </div>

          {/* 3 Key Metrics Stat Cards */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
            {feature.metrics.map((metric, mIdx) => (
              <div
                key={mIdx}
                className="bg-card/70 border-border/80 relative flex flex-col items-center justify-center rounded-3xl border p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:shadow-md"
              >
                <div className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                  <span className="from-primary bg-gradient-to-r to-orange-500 bg-clip-text text-transparent">
                    {metric.value}
                  </span>
                </div>
                <div className="text-foreground pt-1.5 text-sm font-bold">
                  {metric.label}
                </div>
                <div className="text-muted-foreground pt-1 text-center text-xs">
                  {metric.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Highlights checklist pills */}
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 pt-2 text-left text-xs sm:grid-cols-2 sm:text-sm">
            {feature.highlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-card/60 border-border/60 flex items-center gap-2.5 rounded-2xl border p-3.5 shadow-2xs"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <IconCheck size={13} strokeWidth={3} />
                </div>
                <span className="text-foreground/90 leading-tight font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Safari Screen Preview with Floating Glassmorphic Badges */}
        <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
            <Safari
              url={`app.sitepow.store/${feature.slug}`}
              mode="simple"
              className="w-full"
            >
              <div className="size-full min-h-[220px] bg-neutral-200 transition-colors sm:min-h-[420px] dark:bg-neutral-800" />
            </Safari>
            <BorderBeam
              size={200}
              duration={8}
              colorFrom="#f97316"
              colorTo="#3b82f6"
              borderWidth={2}
            />
          </div>

          {/* Floating UI Badges */}
          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div className="bg-card/90 border-border/80 text-foreground flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-md backdrop-blur-md">
              <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
              <span>{feature.floatingBadges.top}</span>
            </div>
            <div className="bg-card/90 border-border/80 text-foreground flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-md backdrop-blur-md">
              <span>{feature.floatingBadges.bottom}</span>
            </div>
          </div>
        </div>

        {/* 3. Before vs After Comparison (วิธีเดิม vs Sitepow Store) */}
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <span className="text-primary text-xs font-semibold">
              เปรียบเทียบก่อนและหลังใช้งาน
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              ความแตกต่างที่คุณจะสัมผัสได้จริง
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              เปรียบเทียบการทำงานแบบเดิมกับการใช้ระบบของ Sitepow Store
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left: Traditional */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] p-5 shadow-xs sm:p-8 dark:bg-rose-500/[0.05]">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    <IconX size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-foreground text-lg font-bold">
                    {feature.comparison.traditional.title}
                  </h3>
                </div>
                <div className="border-border/40 my-3 border-t" />
                <ul className="space-y-3.5">
                  {feature.comparison.traditional.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        <IconX size={12} strokeWidth={3} />
                      </div>
                      <span className="text-muted-foreground leading-snug">
                        {pt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Sitepow Store */}
            <div className="border-primary/40 bg-card/80 shadow-primary/5 relative flex flex-col justify-between rounded-3xl border p-5 shadow-xl backdrop-blur-md sm:p-8">
              <BorderBeam
                size={140}
                duration={7}
                colorFrom="#10b981"
                colorTo="#3b82f6"
                borderWidth={1.5}
              />
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/15 text-primary flex size-9 items-center justify-center rounded-xl">
                    <IconSparkles size={20} />
                  </div>
                  <h3 className="text-foreground text-lg font-bold">
                    {feature.comparison.sitepow.title}
                  </h3>
                </div>
                <div className="border-border/60 my-3 border-t" />
                <ul className="space-y-3.5">
                  {feature.comparison.sitepow.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <IconCheck size={12} strokeWidth={3} />
                      </div>
                      <span className="text-foreground/90 leading-snug font-medium">
                        {pt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 3-Step Workflow Section */}
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <span className="text-primary text-xs font-semibold">
              ขั้นตอนการทำงาน
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              เริ่มต้นใช้งานง่ายๆ เพียง 3 ขั้นตอน
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              ไม่ต้องมีความรู้ทางเทคนิคก็สามารถเริ่มใช้งานและเห็นผลได้ทันที
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {feature.workflow.map((item, wIdx) => (
              <div
                key={wIdx}
                className="bg-card/60 border-border/80 hover:border-border relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-7"
              >
                <div className="space-y-4">
                  <div className="text-primary text-3xl font-black">
                    {item.step}
                  </div>
                  <h3 className="text-foreground text-lg font-bold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Key Capabilities Bento Grid */}
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <span className="text-primary text-xs font-semibold">
              ขีดความสามารถหลัก
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              จุดเด่นและขีดความสามารถที่ออกแบบมาเพื่อคุณ
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {feature.capabilities.map((cap, cIdx) => (
              <div
                key={cIdx}
                className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-7"
              >
                <div className="space-y-3">
                  {cap.badge && (
                    <span className="bg-primary/10 text-primary inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                      {cap.badge}
                    </span>
                  )}
                  <h3 className="text-foreground text-lg font-bold">
                    {cap.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    {cap.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Feature FAQ Section */}
        {feature.faqs.length > 0 && (
          <div className="mx-auto w-full max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-3 text-center">
              <span className="text-primary text-xs font-semibold">
                คำถามที่พบบ่อย
              </span>
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                คำถามที่พบบ่อยเกี่ยวกับ {feature.title}
              </h2>
            </div>

            <div className="border-border/80 bg-card/60 rounded-3xl border p-4 shadow-xs backdrop-blur-xs sm:p-6">
              <Accordion type="single" collapsible className="w-full">
                {feature.faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="border-border/60"
                  >
                    <AccordionTrigger className="text-foreground hover:text-primary cursor-pointer py-4 text-left text-sm font-semibold sm:text-base">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 text-xs leading-relaxed sm:text-sm">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
              >
                <IconHelpCircle size={15} />
                <span>
                  มีคำถามเพิ่มเติมเกี่ยวกับฟังก์ชันนี้? ปรึกษาทีมงานได้ทันที
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* 7. Related Features */}
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-2 text-center">
            <h3 className="text-foreground text-xl font-bold">
              ฟังก์ชันอื่น ๆ ที่ทำงานร่วมกันได้อย่างราบรื่น
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">
              สำรวจเครื่องมืออื่น ๆ ในระบบ Sitepow Store
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedFeatures.map((rel) => (
              <div
                key={rel.slug}
                className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300"
              >
                <Link
                  href={`/features/${rel.slug}`}
                  className="absolute inset-0 z-10 cursor-pointer"
                  aria-label={rel.title}
                />
                <div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                      {rel.icon}
                    </div>
                    <div>
                      <h4 className="text-foreground group-hover:text-primary text-sm font-bold transition-colors">
                        {rel.title}
                      </h4>
                      <span className="text-muted-foreground text-[10px]">
                        {rel.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 pt-3 text-xs leading-relaxed">
                    {rel.shortDescription}
                  </p>
                </div>
                <div className="relative z-20 pt-4">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="group-hover:text-primary w-full cursor-pointer justify-between px-2 text-xs font-semibold"
                  >
                    <Link href={`/features/${rel.slug}`}>
                      <span>เรียนรู้เพิ่มเติม</span>
                      <IconArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Closing CTA Banner */}
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
