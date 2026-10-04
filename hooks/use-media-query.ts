import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string, defaultValue = false): boolean => {
  const [matches, setMatches] = useState(defaultValue)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = () => setMatches(media.matches)

    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
