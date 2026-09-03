'use server'

import { cookies } from 'next/headers'

import { SUPPORTED_LNGS } from '@/constants/system'

export async function setUserLocale(locale: string) {
  if (!SUPPORTED_LNGS.includes(locale)) {
    return
  }

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
