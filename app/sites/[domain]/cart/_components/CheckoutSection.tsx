import { PencilIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CheckoutSectionProps {
  title: string
  isActive: boolean
  isCompleted: boolean
  onEdit: () => void
  children: [React.ReactNode, React.ReactNode]
  isDisabled?: boolean
}

export function CheckoutSection({
  title,
  isActive,
  isCompleted,
  onEdit,
  children,
  isDisabled = false,
}: CheckoutSectionProps) {
  const [editView, summaryView] = children

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-all duration-300',
        isDisabled
          ? 'bg-foreground/5 border-border opacity-60'
          : isActive
            ? 'border-(--brand-color) shadow-md'
            : 'bg-foreground/5 border-border',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between px-5 py-3 transition-colors',
          isActive && !isDisabled
            ? 'bg-(--brand-color) text-white'
            : 'bg-transparent',
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-bold',
              !isActive && !isCompleted && !isDisabled && 'opacity-40',
            )}
          >
            {title}
          </span>
        </div>
        {!isActive && isCompleted && !isDisabled && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <PencilIcon className="size-3" /> แก้ไข
          </button>
        )}
      </div>
      {!isDisabled && (
        <>
          <div
            className={cn(
              'transition-all duration-300',
              isActive
                ? 'px-5 py-3 opacity-100'
                : 'h-0 overflow-hidden opacity-0',
            )}
          >
            {isActive && editView}
          </div>
          {!isActive && isCompleted && (
            <div className="border-border bg-background dark:bg-foreground/5 border-t px-5 py-3">
              {summaryView}
            </div>
          )}
        </>
      )}
    </div>
  )
}
