import { LogoBrand } from './LogoBrand'

export const ProtectedByBrand = () => {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5 px-2.5 text-sm text-gray-600">
      protected & managed by <LogoBrand />
    </div>
  )
}
