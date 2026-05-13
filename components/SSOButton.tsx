import { ComponentPropsWithoutRef } from 'react'

import { LoginProvide } from '@/types/login'
import { RegisterProvide } from '@/types/register'

import { cn } from '@/lib/utils'

interface SSOButtonProps
  extends
    RegisterProvide,
    LoginProvide,
    Omit<ComponentPropsWithoutRef<'div'>, 'id'> {}

export function SSOButton({ icon, name, ...props }: SSOButtonProps) {
  return (
    <div
      className={cn(
        'group flex min-w-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-gray-200 py-2.5',
        name && 'w-full px-5',
      )}
      {...props}
    >
      <div className="flex size-8 shrink-0 items-center justify-center">
        {icon}
      </div>

      {name && (
        <p className="mx-auto text-xl font-bold text-neutral-400 duration-200 group-hover:text-neutral-800">
          {name}
        </p>
      )}
    </div>
  )
}
