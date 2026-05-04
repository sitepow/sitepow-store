import Link from 'next/link'

import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SeeMoreButtonProps {
  href: string
}

export function SeeMoreButton({ href }: SeeMoreButtonProps) {
  return (
    <Link href={href}>
      <Button variant="outline" className="w-full md:w-auto">
        <span>ดูทั้งหมด</span>
        <ArrowRightIcon className="ml-2 size-4" />
      </Button>
    </Link>
  )
}
