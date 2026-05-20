import { ComponentType } from 'react'

import Link from 'next/link'

import { NavigationMenuLink } from '../../ui/navigation-menu'

export function ListItem({
  title,
  children,
  href,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string
  icon?: ComponentType<{ className?: string; size?: number }>
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="flex flex-col gap-1 text-sm">
            {Icon && <Icon className="text-primary mb-2" />}
            <div className="leading-none font-medium">{title}</div>
            {children && (
              <div className="text-muted-foreground line-clamp-2">
                {children}
              </div>
            )}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
