'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLine,
  IconBrandMessenger,
  IconExternalLink,
} from '@tabler/icons-react'

import { LogoBrand } from '@/components/LogoBrand'

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
      icon: <IconBrandFacebook className="size-5" />,
      href: 'https://web.facebook.com/profile.php?id=61584675643468',
      label: 'Facebook',
    },
    {
      icon: <IconBrandMessenger className="size-5" />,
      href: 'https://m.me/61584675643468',
      label: 'Messenger',
    },
    {
      icon: <IconBrandLine className="size-5" />,
      href: 'https://line.me/ti/p/~@830sdfow',
      label: 'LINE Official',
    },
    {
      icon: <IconBrandInstagram className="size-5" />,
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
          label: t('columns.pricing.buyout'),
          href: '/pricing/buyout',
          badge: t('columns.pricing.buyoutBadge'),
          highlight: true,
        },
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
    <footer className="bg-[#282828] text-neutral-300">
      <div className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col items-start space-y-6 lg:col-span-4">
            <div className="space-y-4">
              <LogoBrand className="text-white" />
              <p className="max-w-xs text-sm leading-relaxed text-neutral-300/90">
                {t('description')}
              </p>
            </div>

            <div>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#1890ff] px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1580e6]"
              >
                {t('columns.help.contact') || 'ติดต่อเรา'}
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:col-span-8 lg:gap-x-10 xl:grid-cols-4">
            {footerNav.map((col, idx) => (
              <div key={idx} className="flex flex-col space-y-4">
                <h3 className="text-base font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link, linkIdx) => {
                    const isExternal = link.external
                    const linkClass =
                      'group inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-white sm:text-sm'
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
                              <span className="shrink-0 rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] leading-none text-neutral-300">
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

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-700/60 pt-8 sm:flex-row">
          <div className="w-full text-center text-xs text-neutral-400">
            <p>
              © {currentYear} Sitepow Co., Ltd.{' '}
              <span>{t.raw('rights') as string}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
