'use client'

import { useEffect } from 'react'

export default function AuthSuccessPage() {
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const redirectCookie = cookies.find((c) =>
      c.trim().startsWith('post_login_redirect='),
    )

    if (redirectCookie) {
      const originalUrl = decodeURIComponent(redirectCookie.split('=')[1])

      document.cookie = 'post_login_redirect=; path=/; max-age=0'

      window.location.href = originalUrl
    } else {
      window.location.href = '/'
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">
        กำลังเข้าสู่ระบบ กรุณารอสักครู่...
      </p>
    </div>
  )
}
