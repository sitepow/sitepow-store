import { ComponentPropsWithoutRef } from 'react'

import { LoginProvide } from '@/types/login'
import { RegisterProvide } from '@/types/register'

import { cn } from '@/lib/utils'

interface SSOButtonProps
  extends
    RegisterProvide,
    LoginProvide,
    Omit<ComponentPropsWithoutRef<'button'>, 'id'> {}

export function SSOButton({ icon, name, className, ...props }: SSOButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'group border-input bg-background/80 text-foreground hover:bg-muted/80 hover:border-foreground/20 focus-visible:ring-ring/50 relative flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 text-sm font-medium shadow-xs transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <div className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-5">
        {icon}
      </div>

      {name && (
        <span className="text-foreground/80 group-hover:text-foreground truncate text-sm font-medium transition-colors">
          {name}
        </span>
      )}
    </button>
  )
}
