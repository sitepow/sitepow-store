'use client'

import { useTranslations } from 'next-intl'

export interface StoreNavbarItem {
  title: string
  href?: string
  children?: { title: string; href: string }[]
}

export function useStoreNavbarItems(): StoreNavbarItem[] {
  const t = useTranslations('storefront.navbar')

  return [
    {
      title: t('aboutStore'),
      href: '/',
      children: [
        {
          title: t('storeDetail'),
          href: '/about',
        },
        {
          title: t('faqs'),
          href: '/faqs',
        },
        {
          title: t('storeRating'),
          href: '/customer-reviews',
        },
        {
          title: t('howToOrder'),
          href: '/description',
        },
        {
          title: t('privacyPolicy'),
          href: '/privacy-policy',
        },
        {
          title: t('returnPolicy'),
          href: '/refund-return-policy',
        },
      ],
    },
    { title: t('myOrders'), href: '/user/orders' },
    { title: t('allBlogs'), href: '/blogs' },
  ]
}

export const STORE_NAVBAR_ITEMS: StoreNavbarItem[] = [
  {
    title: 'About Store',
    href: '/',
    children: [
      {
        title: 'Store Details',
        href: '/about',
      },
      {
        title: 'FAQs',
        href: '/faqs',
      },
      {
        title: 'Store Rating',
        href: '/customer-reviews',
      },
      {
        title: 'How to Order',
        href: '/description',
      },
      {
        title: 'Privacy Policy',
        href: '/privacy-policy',
      },
      {
        title: 'Return Policy',
        href: '/refund-return-policy',
      },
    ],
  },
  { title: 'My Orders', href: '/user/orders' },
  { title: 'All Blogs', href: '/blogs' },
]
