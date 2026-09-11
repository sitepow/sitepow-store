'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconArrowUp,
  IconBuildingStore,
  IconCheck,
  IconClock,
  IconCookie,
  IconDatabase,
  IconFileText,
  IconLock,
  IconMail,
  IconPrinter,
  IconRefresh,
  IconShare,
  IconShieldCheck,
  IconTarget,
  IconUserCheck,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PrivacyContent() {
  const t = useTranslations('privacy')

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
    { id: 'collection', title: t('sections.collection.title') },
    { id: 'purpose', title: t('sections.purpose.title') },
    { id: 'disclosure', title: t('sections.disclosure.title') },
    { id: 'security', title: t('sections.security.title') },
    { id: 'retention', title: t('sections.retention.title') },
    { id: 'rights', title: t('sections.rights.title') },
    { id: 'cookies', title: t('sections.cookies.title') },
    { id: 'updates', title: t('sections.updates.title') },
    { id: 'contact', title: t('sections.contact.title') },
  ]

  return (
    <div className="text-foreground mx-auto w-full max-w-5xl space-y-10 px-4 py-6 sm:px-6 sm:py-10">
      {/* Top Switcher Tabs */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="bg-muted/70 inline-flex items-center gap-1 rounded-xl border p-1 shadow-xs">
          <Link href="/terms">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 rounded-lg text-xs font-medium"
            >
              <IconFileText size={15} />
              {t('nav.terms')}
            </Button>
          </Link>
          <Link href="/privacy">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 rounded-lg text-xs font-semibold shadow-xs"
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
            className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <IconShieldCheck className="h-3.5 w-3.5" />
            {t('badge.label')}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {t('badge.version')}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground text-xs">
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
                  {toc.map((item) => (
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

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="space-y-2 p-4 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <IconShieldCheck size={16} />
                  PDPA Compliant
                </div>
                <p className="text-muted-foreground">
                  คุ้มครองข้อมูลตามมาตรฐานสากลและ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
                  พ.ศ. 2562
                </p>
                <Link
                  href="/contact"
                  className="inline-block pt-1 font-medium text-emerald-600 hover:underline dark:text-emerald-400"
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

          {/* Section 2: Collection */}
          <section id="collection" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconDatabase className="text-primary size-5" />
                  {t('sections.collection.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4 text-sm leading-relaxed">
                <p>{t('sections.collection.p1')}</p>
                <div className="grid gap-3 sm:grid-cols-1">
                  <div className="bg-muted/30 space-y-1 rounded-xl border p-3.5">
                    <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                      {t('sections.collection.item1')}
                    </div>
                  </div>
                  <div className="bg-muted/30 space-y-1 rounded-xl border p-3.5">
                    <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                      {t('sections.collection.item2')}
                    </div>
                  </div>
                  <div className="bg-muted/30 space-y-1 rounded-xl border p-3.5">
                    <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                      {t('sections.collection.item3')}
                    </div>
                  </div>
                  <div className="bg-muted/30 space-y-1 rounded-xl border p-3.5">
                    <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                      {t('sections.collection.item4')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Purpose */}
          <section id="purpose" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconTarget className="text-primary size-5" />
                  {t('sections.purpose.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.purpose.p1')}</p>
                <ul className="text-muted-foreground space-y-2 pl-1 text-xs">
                  <li className="flex items-start gap-2">
                    <IconCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{t('sections.purpose.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{t('sections.purpose.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{t('sections.purpose.item3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{t('sections.purpose.item4')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IconCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{t('sections.purpose.item5')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 4: Disclosure */}
          <section id="disclosure" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconShare className="text-primary size-5" />
                  {t('sections.disclosure.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.disclosure.p1')}</p>
                <ul className="text-muted-foreground space-y-2 pl-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t('sections.disclosure.item1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t('sections.disclosure.item2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t('sections.disclosure.item3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t('sections.disclosure.item4')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Security */}
          <section id="security" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconLock className="text-primary size-5" />
                  {t('sections.security.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.security.p1')}</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="bg-muted/40 space-y-1 rounded-xl border p-3 text-xs">
                    <div className="text-foreground font-semibold">
                      TLS/SSL 256-bit
                    </div>
                    <p className="text-muted-foreground">
                      {t('sections.security.item1')}
                    </p>
                  </div>
                  <div className="bg-muted/40 space-y-1 rounded-xl border p-3 text-xs">
                    <div className="text-foreground font-semibold">
                      Cryptographic Hash
                    </div>
                    <p className="text-muted-foreground">
                      {t('sections.security.item2')}
                    </p>
                  </div>
                  <div className="bg-muted/40 space-y-1 rounded-xl border p-3 text-xs">
                    <div className="text-foreground font-semibold">
                      Role-Based Access
                    </div>
                    <p className="text-muted-foreground">
                      {t('sections.security.item3')}
                    </p>
                  </div>
                  <div className="bg-muted/40 space-y-1 rounded-xl border p-3 text-xs">
                    <div className="text-foreground font-semibold">
                      Disaster Recovery
                    </div>
                    <p className="text-muted-foreground">
                      {t('sections.security.item4')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 6: Retention */}
          <section id="retention" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconClock className="text-primary size-5" />
                  {t('sections.retention.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.retention.p1')}</p>
                <p>{t('sections.retention.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 7: User Rights */}
          <section id="rights" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconUserCheck className="text-primary size-5" />
                  {t('sections.rights.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.rights.p1')}</p>
                <div className="grid gap-2 sm:grid-cols-1">
                  {[
                    t('sections.rights.item1'),
                    t('sections.rights.item2'),
                    t('sections.rights.item3'),
                    t('sections.rights.item4'),
                    t('sections.rights.item5'),
                    t('sections.rights.item6'),
                    t('sections.rights.item7'),
                  ].map((right, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 text-foreground flex items-start gap-2.5 rounded-lg border p-2.5 text-xs"
                    >
                      <span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        {index + 1}
                      </span>
                      <span>{right}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 8: Cookies */}
          <section id="cookies" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconCookie className="text-primary size-5" />
                  {t('sections.cookies.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.cookies.p1')}</p>
                <p>{t('sections.cookies.p2')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 9: Updates */}
          <section id="updates" className="scroll-mt-24">
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                  <IconRefresh className="text-primary size-5" />
                  {t('sections.updates.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                <p>{t('sections.updates.p1')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 10: Contact DPO */}
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
                <div className="bg-muted/40 space-y-1 rounded-xl border p-4 text-xs">
                  <p className="text-foreground font-semibold">
                    {t('sections.contact.company')}
                  </p>
                  <p className="text-muted-foreground">
                    {t('sections.contact.org')}
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
