import { ReactNode } from 'react'

import Link from 'next/link'

import { NavigationMenuLink } from '../../ui/navigation-menu'

export function ListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string; icon?: ReactNode }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="flex flex-col gap-1 text-sm">
            {icon && <div className="text-primary mb-2.5">{icon}</div>}
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
