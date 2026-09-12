'use client'

import { useEffect } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

const STORAGE_PREFIX = 'sitepow_aff_ref_'

export function getStoredAffiliateCode(storeSlug: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const key = `${STORAGE_PREFIX}${storeSlug}`
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    const item = JSON.parse(itemStr)
    const now = Date.now()
    if (now > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.code || null
  } catch {
    return null
  }
}

export function setStoredAffiliateCode(
  storeSlug: string,
  code: string,
  days = 30,
) {
  if (typeof window === 'undefined') return
  try {
    const key = `${STORAGE_PREFIX}${storeSlug}`
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000
    localStorage.setItem(key, JSON.stringify({ code, expiry }))
  } catch (e) {
    console.error('Error saving affiliate code:', e)
  }
}

export function useAffiliateTracking() {
  const searchParams = useSearchParams()
  const params = useParams()
  const storeSlug = (params?.domain as string) || ''

  useEffect(() => {
    if (!storeSlug) return

    const ref = searchParams?.get('ref') || searchParams?.get('aff')
    if (ref && ref.trim()) {
      setStoredAffiliateCode(storeSlug, ref.trim())
    }
  }, [searchParams, storeSlug])
}
