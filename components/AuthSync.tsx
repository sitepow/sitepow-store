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

    const checkAndFixSession = async () => {
      const hasSessionCookie = document.cookie.includes(
        'better-auth.session_token',
      )

      if (
        !hasSessionCookie &&
        localStorage.getItem('is_logged_in') === 'true'
      ) {
        try {
          const res = await fetch(
            'https://accounts.sitepow.store/api/auth/get-session',
            {
              credentials: 'include',
            },
          )

          if (res.ok) {
            const data = await res.json()
            if (data?.session) {
              window.location.reload()
            } else {
              localStorage.removeItem('is_logged_in')
            }
          }
        } catch (err) {
          console.error(err)
        }
      }
    }

    checkAndFixSession()
  }, [])

  return null
}
