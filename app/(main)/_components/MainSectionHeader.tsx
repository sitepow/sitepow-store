import { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface MainSectionHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  as?: ElementType
}

export function MainSectionHeader({
  badge,
  title,
  description,
  as: Heading = 'h2',
  className,
  ...props
}: MainSectionHeaderProps) {
  return (
    <div
      className={cn(
        'mx-auto flex flex-col items-center text-center',
        'max-w-3xl space-y-3 px-4 sm:space-y-4',
        className,
      )}
      {...props}
    >
      {badge && (
        <span className="text-primary text-xs font-semibold tracking-wide uppercase">
          {badge}
        </span>
      )}

      {/* เอา max-w-52 ออก แล้วใช้ max-w-2xl พร้อม balance text */}
      <Heading className="text-foreground max-w-2xl text-2xl font-bold tracking-tight text-balance sm:text-3xl md:text-4xl md:leading-tight">
        {title}
      </Heading>

      {/* ควบคุมความยาว Description ให้อ่านสบายตา ไม่ยาวเกินไป */}
      {description && (
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
