'use client'

import {
  usePathname,
  // useRouter
} from 'next/navigation'

import { LANGUAGE_NAMES, SUPPORTED_LNGS } from '@/constants/system'
import { VariantProps } from 'class-variance-authority'
import { Languages } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ButtonVariants = VariantProps<typeof buttonVariants>

interface ModeToggleProps {
  buttonVariant?: ButtonVariants['variant']
}

export function LanguageSwitcher({
  buttonVariant = 'outline',
}: ModeToggleProps) {
  const pathname = usePathname()
  // const router = useRouter()

  const currentLocale = pathname.split('/')[1]

  const switchLocale = (locale: string) => {
    // if (currentLocale === locale) return
    // const segments = pathname.split('/')
    // segments[1] = locale
    // router.push(segments.join('/'))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size="icon-lg">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LNGS.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => switchLocale(lng)}
            className={currentLocale === lng ? 'bg-accent' : ''}
          >
            {LANGUAGE_NAMES[lng] || lng}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
