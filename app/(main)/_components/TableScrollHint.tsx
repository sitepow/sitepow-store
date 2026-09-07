import { cn } from '@/lib/utils'

export function TableScrollHint({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'text-muted-foreground flex items-center justify-end gap-1 text-xs md:hidden',
        className,
      )}
    >
      <span>เลื่อนซ้าย-ขวาเพื่อดูตาราง</span>
      <span>⇄</span>
    </div>
  )
}
