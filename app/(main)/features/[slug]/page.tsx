import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { FEATURE_METAS, getLocalizedFeature } from '@/constants/features'
import { IconCheck } from '@tabler/icons-react'

import { EmptyImage } from '@/components/EmptyImage'
import { CtaSection } from '@/components/landing-template/CtaSection'
import { MainLayout } from '@/components/layout/Layout'

import { cn } from '@/lib/utils'

interface FeaturePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return FEATURE_METAS.map((feature) => ({
    slug: feature.slug,
  }))
}

export async function generateMetadata({
  params,
}: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params
  const t = await getTranslations('features')
  const feature = getLocalizedFeature(slug, t)
  if (!feature) {
    return {
      title: 'Sitepow Store',
    }
  }
  return {
    title: `${feature.title} | Sitepow Store`,
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
  const t = await getTranslations('features')
  const feature = getLocalizedFeature(slug, t)

  if (!feature) {
    notFound()
  }

  const sections = feature.capabilities

  return (
    <MainLayout className="flex flex-col items-center overflow-hidden bg-white pt-0 pb-0 dark:bg-neutral-950">
      <section className="from-primary relative flex w-full items-center justify-center overflow-hidden bg-linear-to-r via-indigo-600 to-sky-400 py-16 text-white sm:py-20 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-8 h-64 w-64 border-24 border-white/20 border-t-transparent border-l-transparent opacity-60 sm:-top-16 sm:-right-4 sm:h-96 sm:w-96 sm:border-36"
          style={{
            transform: 'rotate(-45deg)',
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center">
          <span className="text-xs font-medium tracking-wider text-white/85 sm:text-sm">
            {feature.categoryLabel}
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {feature.title}
          </h1>
          {feature.tagline && (
            <p className="mt-2 max-w-2xl text-xs text-white/80 sm:text-sm md:text-base">
              {feature.tagline}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto mt-14 w-full max-w-6xl space-y-16 px-4 sm:mt-20 sm:space-y-24 sm:px-6 lg:px-8">
        {sections.map((item, idx) => {
          const isReversed = idx % 2 !== 0

          return (
            <div
              key={idx}
              className={cn(
                'flex flex-col items-center justify-between gap-8 md:flex-row lg:gap-16',
                isReversed && 'md:flex-row-reverse',
              )}
            >
              <div className="relative aspect-4/3 w-full max-w-md shrink-0 overflow-hidden rounded-2xl bg-neutral-100 shadow-lg dark:bg-neutral-900">
                <EmptyImage className="size-full bg-gray-50 md:size-full" />

                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 bg-sky-500/30 blur-2xl" />
                <div
                  className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 border-r-80 border-b-120 border-t-transparent border-l-transparent opacity-85"
                  style={{
                    borderRightColor: 'transparent',
                    borderBottomColor: '#0ea5e9',
                  }}
                />
              </div>

              <div className="flex w-full flex-col items-start space-y-3 sm:space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-neutral-800 sm:text-2xl dark:text-neutral-100">
                  {item.title}
                </h2>

                <p className="text-xs leading-relaxed text-neutral-500 sm:text-sm dark:text-neutral-400">
                  {item.description}
                </p>

                <ul className="w-full space-y-2.5 pt-2">
                  {feature.highlights.slice(0, 4).map((highlight, hIdx) => (
                    <li
                      key={hIdx}
                      className="flex items-center gap-2.5 text-xs text-neutral-600 sm:text-sm dark:text-neutral-300"
                    >
                      <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                        <IconCheck size={12} strokeWidth={3} />
                      </div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      <CtaSection title={t('cta.title')} registerBtn={t('cta.button')} />
    </MainLayout>
  )
}
