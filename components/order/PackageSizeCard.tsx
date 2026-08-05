import { IconPackage } from '@tabler/icons-react'

interface OrderPackageSizeCardProps {
  totalWeight?: number | null
  width?: number | null
  height?: number | null
  length?: number | null
}

export function OrderPackageSizeCard({
  totalWeight,
  width,
  height,
  length,
}: OrderPackageSizeCardProps) {
  if (!totalWeight && !width && !height && !length) {
    return null
  }

  return (
    <div className="space-y-1.5 rounded-lg border p-3 text-xs">
      <div className="text-muted-foreground flex items-center gap-1.5 font-semibold tracking-wider uppercase">
        <IconPackage size={15} /> ขนาดและน้ำหนักพัสดุ
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {totalWeight && <span>น้ำหนัก: {totalWeight} กก.</span>}
        {(width || height || length) && (
          <span>
            ขนาด (กxยxส): {width || 0} x {length || 0} x {height || 0} ซม.
          </span>
        )}
      </div>
    </div>
  )
}
