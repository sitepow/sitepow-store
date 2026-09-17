import { ShieldCheckIcon } from 'lucide-react'

import { LogoBrand } from './LogoBrand'

export const ProtectedByBrand = () => {
  return (
    <div className="text-muted-foreground font-landing mb-4 flex flex-wrap items-center justify-center gap-2 px-2.5 text-xs">
      <ShieldCheckIcon className="text-primary size-3.5 shrink-0" />
      <span>Protected & managed by</span>
      <LogoBrand className="text-base font-semibold" />
    </div>
  )
}
