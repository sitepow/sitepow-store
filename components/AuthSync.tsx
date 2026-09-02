'use client'

import { useEffect } from 'react'

export function AuthSync() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authToken = params.get('auth_token')

    if (authToken) {
      const maxAge = 60 * 60 * 24 * 7
      const isSecure = window.location.protocol === 'https:'

      document.cookie = `better-auth.session_token=${authToken}; path=/; max-age=${maxAge}; SameSite=Lax; ${isSecure ? 'Secure' : ''}`

      params.delete('auth_token')
      const newSearch = params.toString()
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : '')
      window.history.replaceState({}, '', newUrl)

      window.location.reload()
      return
    }

    const hasSessionCookie = document.cookie.includes(
      'better-auth.session_token',
    )

    if (!hasSessionCookie && !window.location.pathname.startsWith('/login')) {
      const currentUrl = window.location.href
      const accountsLoginUrl = `https://accounts.sitepow.store/login?callbackUrl=${encodeURIComponent(currentUrl)}`

      if (!document.referrer.includes('accounts.sitepow.store')) {
        window.location.href = accountsLoginUrl
      }
    }
  }, [])

  return null
}
