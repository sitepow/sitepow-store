import { cn } from '@/lib/utils'

export function ContentDivider({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative my-2 flex w-full items-center justify-center',
        className,
      )}
    >
      <div className="border-border w-full border-t" />
      <span className="bg-card text-muted-foreground absolute px-3 text-xs font-medium">
        {name}
      </span>
    </div>
  )
}
