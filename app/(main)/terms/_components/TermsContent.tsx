'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconAlertTriangle,
  IconArrowUp,
  IconBan,
  IconBuildingStore,
  IconCircleCheck,
  IconCreditCard,
  IconFileText,
  IconGavel,
  IconKey,
  IconMail,
  IconPrinter,
  IconServer,
  IconShieldCheck,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TermsContent() {
  const t = useTranslations('terms')

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const toc = [
    { id: 'intro', title: t('sections.intro.title') },
    { id: 'account', title: t('sections.account.title') },
    { id: 'merchant', title: t('sections.merchant.title') },
    { id: 'pricing', title: t('sections.pricing.title') },
    { id: 'ip', title: t('sections.ip.title') },
    { id: 'sla', title: t('sections.sla.title') },
    { id: 'liability', title: t('sections.liability.title') },
    { id: 'termination', title: t('sections.termination.title') },
    { id: 'governingLaw', title: t('sections.governingLaw.title') },
    { id: 'contact', title: t('sections.contact.title') },
  ]

  return (
    <div className="text-foreground mx-auto w-full max-w-5xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      {/* Top Switcher Tabs */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="bg-muted/70 inline-flex items-center gap-1 rounded-xl border p-1 shadow-xs">
          <Link href="/terms">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 rounded-lg text-xs font-semibold shadow-xs"
            >
              <IconFileText size={15} />
              {t('nav.terms')}
            </Button>
          </Link>
          <Link href="/privacy">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 rounded-lg text-xs font-medium"
            >
              <IconShieldCheck size={15} />
              {t('nav.privacy')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Badge
            variant="outline"
            className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
          >
            <IconFileText className="text-primary h-3.5 w-3.5" />
            {t('badge.label')}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {t('badge.version')}
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400"
          >
            {t('badge.updated')}
          </Badge>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start print:hidden">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 font-medium"
          >
            <IconPrinter size={16} />
            {t('hero.print')}
          </Button>
          <Link href="/contact">
            <Button variant="secondary" className="gap-2 font-medium">
              <IconMail size={16} />
              {t('hero.contact')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Layout with Sidebar TOC */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Table of Contents - Desktop Sticky */}
        <div className="hidden lg:col-span-4 lg:block print:hidden">
          <div className="sticky top-24 space-y-4">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-sm font-semibold">
                  {t('tocTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <nav className="flex flex-col space-y-1 text-xs">
                  {toc.map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="text-muted-foreground hover:text-primary hover:bg-muted/50 line-clamp-1 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-2 p-4 text-xs">
                <div className="text-primary flex items-center gap-1.5 font-semibold">
                  <IconBuildingStore size={15} />
                  Sitepow Store
                </div>
                <p className="text-muted-foreground">LINE OA: @830sdfow</p>
                <Link
                  href="/contact"
                  className="text-primary inline-block pt-1 font-medium hover:underline"
                >
                  {t('hero.contact')} &rarr;
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 lg:col-span-8">
          {/* Section 1: Intro */}
          <section id="intro" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-lg font-bold">
                  {t('sections.intro.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.intro.p1')}</p>
                <p>{t('sections.intro.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Account */}
          <section id="account" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconKey className="text-primary size-5" />
                  {t('sections.account.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.account.p1')}</p>
                <p>{t('sections.account.p2')}</p>
                <div className="bg-muted/50 rounded-xl border p-3 text-xs">
                  {t('sections.account.p3')}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Merchant & Prohibited items */}
          <section id="merchant" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconBuildingStore className="text-primary size-5" />
                  {t('sections.merchant.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4 text-sm leading-relaxed">
                <p>{t('sections.merchant.p1')}</p>
                <div className="border-destructive/20 bg-destructive/5 space-y-2 rounded-xl border p-4">
                  <div className="text-destructive flex items-center gap-1.5 text-xs font-semibold">
                    <IconBan size={15} />
                    {t('sections.merchant.p2')}
                  </div>
                  <ul className="text-muted-foreground space-y-1.5 pl-1 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>{t('sections.merchant.forbidden1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>{t('sections.merchant.forbidden2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>{t('sections.merchant.forbidden3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>{t('sections.merchant.forbidden4')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>{t('sections.merchant.forbidden5')}</span>
                    </li>
                  </ul>
                </div>
                <p>{t('sections.merchant.p3')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 4: Pricing */}
          <section id="pricing" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconCreditCard className="text-primary size-5" />
                  {t('sections.pricing.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.pricing.p1')}</p>
                <p>{t('sections.pricing.p2')}</p>
                <p>{t('sections.pricing.p3')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Intellectual Property */}
          <section id="ip" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconFileText className="text-primary size-5" />
                  {t('sections.ip.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.ip.p1')}</p>
                <p>{t('sections.ip.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 6: SLA & Maintenance */}
          <section id="sla" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconServer className="text-primary size-5" />
                  {t('sections.sla.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.sla.p1')}</p>
                <p>{t('sections.sla.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section id="liability" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconAlertTriangle className="size-5 text-amber-500" />
                  {t('sections.liability.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.liability.p1')}</p>
                <p>{t('sections.liability.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 8: Termination */}
          <section id="termination" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconAlertTriangle className="text-destructive size-5" />
                  {t('sections.termination.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.termination.p1')}</p>
                <p>{t('sections.termination.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 9: Governing Law */}
          <section id="governingLaw" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconGavel className="text-primary size-5" />
                  {t('sections.governingLaw.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.governingLaw.p1')}</p>
                <p>{t('sections.governingLaw.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 10: Contact */}
          <section id="contact" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconMail className="text-primary size-5" />
                  {t('sections.contact.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.contact.p1')}</p>
                <p>{t('sections.contact.p2')}</p>
                <div className="bg-muted/40 space-y-1 rounded-xl border p-4 text-xs">
                  <p className="text-foreground font-semibold">
                    {t('sections.contact.company')}
                  </p>
                  <p>{t('sections.contact.email')}</p>
                  <p>{t('sections.contact.line')}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Scroll to Top */}
          <div className="flex justify-end pt-4 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToTop}
              className="gap-1 text-xs"
            >
              <IconArrowUp size={14} />
              Scroll to top
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
