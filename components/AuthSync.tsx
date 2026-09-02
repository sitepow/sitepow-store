'use client'

import { useEffect } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function AuthSync() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const authToken = searchParams.get('auth_token')
    if (authToken) {
      localStorage.setItem('bearer_token', authToken)

      document.cookie = `better-auth.session_token=${authToken}; path=/; max-age=604800; secure; samesite=lax`

      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('auth_token')
      const query = newParams.toString()
      const url = query ? `${pathname}?${query}` : pathname
      router.replace(url)
    }
  }, [searchParams, router, pathname])

  return null
}
