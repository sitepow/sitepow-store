import { useSyncExternalStore } from 'react'

export const useIsMounted = () => {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
