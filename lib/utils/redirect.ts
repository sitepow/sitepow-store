import { redirect } from 'next/navigation'

export function getSafeRedirectUrl(
  callbackUrl?: string | null,
  fallback = '/'
): string {
  if (!callbackUrl) {
    return fallback
  }

  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl
  }

  try {
    const parsed = new URL(callbackUrl)
    const hostname = parsed.hostname
    if (
      hostname === 'sitepow.store' ||
      hostname.endsWith('.sitepow.store') ||
      hostname === 'lvh.me' ||
      hostname.endsWith('.lvh.me') ||
      hostname === 'localhost'
    ) {
      return callbackUrl
    }
  } catch {
    // invalid URL fallback to fallback
  }

  return fallback
}

export function redirectWithCallback(
  callbackUrl?: string | null,
  fallback = '/'
): never {
  const destination = getSafeRedirectUrl(callbackUrl, fallback)
  redirect(destination)
}

export const redirectToCallback = redirectWithCallback
