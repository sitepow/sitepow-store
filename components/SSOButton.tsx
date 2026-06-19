import { ComponentPropsWithoutRef } from 'react'

import { LoginProvide } from '@/types/login'
import { RegisterProvide } from '@/types/register'

import { cn } from '@/lib/utils'

interface SSOButtonProps
  extends
    RegisterProvide,
    LoginProvide,
    Omit<ComponentPropsWithoutRef<'div'>, 'id'> {}

export function SSOButton({ icon, name, className, ...props }: SSOButtonProps) {
  return (
    <div
      className={cn(
        'group border-border flex min-w-14 cursor-pointer items-center justify-center rounded-2xl border-2 py-2.5',
        name && 'w-full px-5',
        className,
      )}
      {...props}
    >
      <div className="flex size-8 shrink-0 items-center justify-center">
        {icon}
      </div>

      {name && (
        <p className="text-foreground mx-auto text-xl font-bold opacity-70 duration-200 hover:opacity-100">
          {name}
        </p>
      )}
    </div>
  )
}
