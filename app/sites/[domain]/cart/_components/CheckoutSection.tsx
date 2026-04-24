import { CheckCircle2Icon, PencilIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CheckoutSectionProps {
  title: string
  isActive: boolean
  isCompleted: boolean
  onEdit: () => void
  children: [React.ReactNode, React.ReactNode]
}

export function CheckoutSection({
  title,
  isActive,
  isCompleted,
  onEdit,
  children,
}: CheckoutSectionProps) {
  const [editView, summaryView] = children

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-all duration-300',
        isActive ? 'border-primary shadow-md' : 'border-gray-100 bg-gray-50/50',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between px-5 py-3 transition-colors',
          isActive ? 'bg-primary text-white' : 'bg-transparent',
        )}
      >
        <div className="flex items-center gap-2">
          {isCompleted && !isActive && (
            <CheckCircle2Icon className="text-primary size-4" />
          )}
          <span
            className={cn(
              'text-sm font-bold',
              !isActive && !isCompleted && 'opacity-40',
            )}
          >
            {title}
          </span>
        </div>
        {!isActive && isCompleted && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <PencilIcon className="size-3" /> แก้ไข
          </button>
        )}
      </div>

      <div
        className={cn(
          'transition-all duration-300',
          isActive ? 'p-5 opacity-100' : 'h-0 overflow-hidden opacity-0',
        )}
      >
        {isActive && editView}
      </div>

      {!isActive && isCompleted && (
        <div className="border-t border-gray-50 bg-white px-5 py-3">
          {summaryView}
        </div>
      )}
    </div>
  )
}
