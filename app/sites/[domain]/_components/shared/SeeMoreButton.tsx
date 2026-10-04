import Link from 'next/link'

import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SeeMoreButtonProps {
  href: string
}

export function SeeMoreButton({ href }: SeeMoreButtonProps) {
  return (
    <Link href={href} className="flex shrink-0 items-center justify-center">
      <Button variant="outline" className="whitespace-nowrap">
        <span>ดูทั้งหมด</span>
        <ArrowRightIcon className="size-4" />
      </Button>
    </Link>
  )
}
