'use client'

import { useCallback } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useQueryParam(key: string = 'tab', defaultValue: string = '') {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const paramValue = searchParams.get(key) || defaultValue

  const setParamValue = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (newValue) {
        params.set(key, newValue)
      } else {
        params.delete(key)
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [key, pathname, router, searchParams],
  )

  return [paramValue, setParamValue] as const
}
