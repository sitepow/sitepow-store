'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { NAVBAR_ITEMS } from '@/constants/navbar'
import { LockIcon } from 'lucide-react'

import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface MobileMenuItemsProps {
  onClose: () => void
  isAuthenticated: boolean
  loginHref: string
  registerHref: string
}

export function MobileMenuItems({
  onClose,
  isAuthenticated,
  loginHref,
  registerHref,
}: MobileMenuItemsProps) {
  const tNav = useTranslations('common.navbar')
  const tFeatures = useTranslations('home.features')

  const navKeys: Array<
    'features' | 'pricing' | 'downloadPos' | 'blogs' | 'docs' | 'contact'
  > = ['features', 'pricing', 'downloadPos', 'blogs', 'docs', 'contact']

  return (
    <div className="flex flex-col space-y-4 px-6 py-8">
      {NAVBAR_ITEMS.map((item, idx) => {
        const title = navKeys[idx] ? tNav(navKeys[idx]) : item.title

        return (
          <div key={idx} className="flex flex-col">
            {item.children ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-semibold">
                    {title}
                  </p>
                  <Link
                    href="/features"
                    onClick={onClose}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    {tNav('viewAllFeatures')}
                  </Link>
                </div>
                <div className="border-border ml-2 flex flex-col space-y-3 border-l-2 pl-4">
                  {item.children.map((child, childIdx) => {
                    const childTitle = tFeatures.raw(
                      `items.${childIdx}.title`,
                    ) as string

                    return (
                      <Link
                        key={childIdx}
                        href={child.href}
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground active:text-primary text-base font-medium transition-colors"
                      >
                        {childTitle}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <Link
                href={item.href!}
                onClick={onClose}
                className="text-foreground hover:text-primary text-lg font-medium transition-colors"
              >
                {title}
              </Link>
            )}
          </div>
        )
      })}
      {!isAuthenticated && (
        <>
          <div className="pt-4">
            <Separator />
          </div>
          <div className="flex flex-col gap-3 pt-4 pb-10">
            <Link href={loginHref} onClick={onClose}>
              <Button
                variant="outline"
                className="w-full justify-center gap-2 py-6 text-base font-medium"
              >
                <LockIcon size={18} />
                {tNav('login')}
              </Button>
            </Link>
            <Link href={registerHref} onClick={onClose}>
              <RainbowButton
                size="lg"
                className="w-full justify-center py-6 text-base font-medium"
              >
                {tNav('register')}
              </RainbowButton>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
