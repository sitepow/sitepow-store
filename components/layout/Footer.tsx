'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLine,
  IconBrandMessenger,
  IconExternalLink,
  IconHeadset,
} from '@tabler/icons-react'

import { LogoBrand } from '@/components/LogoBrand'
import { QuickSettingsMenu } from '@/components/QuickSettingsMenu'

interface FooterLink {
  label: string
  href: string
  badge?: string
  highlight?: boolean
  external?: boolean
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

export function Footer() {
  const t = useTranslations('common.footer')
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: <IconBrandFacebook className="size-4" />,
      href: 'https://web.facebook.com/profile.php?id=61584675643468',
      label: 'Facebook',
    },
    {
      icon: <IconBrandMessenger className="size-4" />,
      href: 'https://m.me/61584675643468',
      label: 'Messenger',
    },
    {
      icon: <IconBrandLine className="size-4" />,
      href: 'https://line.me/ti/p/~@830sdfow',
      label: 'LINE Official',
    },
    {
      icon: <IconBrandInstagram className="size-4" />,
      href: 'https://www.instagram.com/sitepow.store',
      label: 'Instagram',
    },
  ]

  const footerNav: FooterColumn[] = [
    {
      title: t('columns.features.title'),
      links: [
        {
          label: t('columns.features.pos'),
          href: '/features/pos',
          badge: t('columns.features.posBadge'),
        },
        {
          label: t('columns.features.ai'),
          href: '/features/ai',
          badge: t('columns.features.aiBadge'),
        },
        { label: t('columns.features.inventory'), href: '/features/inventory' },
        {
          label: t('columns.features.onlineStore'),
          href: '/features/online-store',
        },
        { label: t('columns.features.crm'), href: '/features/crm' },
        {
          label: t('columns.features.allFeatures'),
          href: '/features',
          highlight: true,
        },
      ],
    },
    {
      title: t('columns.download.title'),
      links: [
        {
          label: t('columns.download.windows'),
          href: '/download-pos',
          badge: t('columns.download.windowsBadge'),
        },
        { label: t('columns.download.android'), href: '/download-pos' },
        { label: t('columns.download.ios'), href: '/download-pos' },
        { label: t('columns.download.macos'), href: '/download-pos' },
        { label: t('columns.download.web'), href: '/download-pos' },
        { label: t('columns.download.hardware'), href: '/download-pos' },
      ],
    },
    {
      title: t('columns.pricing.title'),
      links: [
        { label: t('columns.pricing.packages'), href: '/pricing' },
        {
          label: t('columns.pricing.zeroGp'),
          href: '/pricing',
          badge: t('columns.pricing.zeroGpBadge'),
        },
        { label: t('columns.pricing.yearlyDiscount'), href: '/pricing' },
        { label: t('columns.pricing.compare'), href: '/pricing' },
        { label: t('columns.pricing.roi'), href: '/pricing' },
        { label: t('columns.pricing.enterprise'), href: '/contact' },
      ],
    },
    {
      title: t('columns.help.title'),
      links: [
        { label: t('columns.help.contact'), href: '/contact' },
        {
          label: t('columns.help.line'),
          href: 'https://line.me/ti/p/~@830sdfow',
          external: true,
        },
        { label: t('columns.help.faq'), href: '/#faq' },
        { label: t('columns.help.blogs'), href: '/blogs' },
        { label: t('columns.help.terms'), href: '/terms' },
        { label: t('columns.help.privacy'), href: '/privacy' },
        { label: t('columns.help.security'), href: '/contact' },
      ],
    },
  ]

  return (
    <footer className="border-border/40 bg-background text-foreground border-t transition-colors">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col justify-between space-y-6 lg:col-span-4">
            <div className="space-y-4">
              <LogoBrand />
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                {t('description')}
              </p>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-3">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <IconHeadset className="text-primary size-4 shrink-0" />
                  <span>{t('supportHours')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-muted-foreground mb-3 text-xs font-medium">
                {t('followUs')}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-xl border transition-all hover:shadow-xs active:scale-95"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8 lg:gap-x-8">
            {footerNav.map((col, idx) => (
              <div key={idx} className="flex flex-col space-y-4">
                <h3 className="text-foreground text-sm font-semibold">
                  {col.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link, linkIdx) => {
                    const isExternal = link.external
                    const linkClass = `group inline-flex items-center gap-1.5 text-xs sm:text-sm transition-colors ${
                      link.highlight
                        ? 'text-primary font-medium hover:underline'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                    return (
                      <li key={linkIdx} className="leading-snug">
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            <span>{link.label}</span>
                            <IconExternalLink className="size-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        ) : (
                          <Link href={link.href} className={linkClass}>
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="border-primary/20 bg-primary/10 text-primary shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] leading-none font-medium">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border/40 mt-14 flex flex-col-reverse items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="text-muted-foreground text-center text-xs sm:text-left">
            <p>
              © {currentYear} Sitepow Co., Ltd.{' '}
              <span>{t.raw('rights') as string}</span>
            </p>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-xs">
            <QuickSettingsMenu buttonVariant="ghost" />
          </div>
        </div>
      </div>
    </footer>
  )
}
