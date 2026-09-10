import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

import { routing } from './routing'

type SupportedLocale = (typeof routing.locales)[number]

type MessageLoader = () => Promise<{ default: Record<string, unknown> }>

const MESSAGE_LOADERS: Record<SupportedLocale, MessageLoader> = {
  th: () => import('./locales/th'),
  en: () => import('./locales/en'),
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale

  let locale: SupportedLocale = routing.defaultLocale

  if (requestedLocale && hasLocale(routing.locales, requestedLocale)) {
    locale = requestedLocale as SupportedLocale
  } else {
    try {
      const headerStore = await headers()
      const headerLocale = headerStore.get('x-next-intl-locale')
      if (headerLocale && hasLocale(routing.locales, headerLocale)) {
        locale = headerLocale as SupportedLocale
      } else {
        const cookieStore = await cookies()
        const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
        if (cookieLocale && hasLocale(routing.locales, cookieLocale)) {
          locale = cookieLocale as SupportedLocale
        }
      }
    } catch {}
  }

  const loadMessages =
    MESSAGE_LOADERS[locale] ?? MESSAGE_LOADERS[routing.defaultLocale]

  const messages = (await loadMessages()).default

  return {
    locale,
    messages,
  }
})
