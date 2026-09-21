import { LogoBrand } from './LogoBrand'

export const ProtectedByBrand = () => {
  return (
    <div className="text-foreground mb-5 flex flex-wrap items-center justify-center gap-2.5 px-2.5 text-sm">
      <span className="opacity-60">protected & managed by</span> <LogoBrand />
    </div>
  )
}
