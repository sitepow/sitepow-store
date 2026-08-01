import { TagIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

interface BlogTagsProps {
  tags?: string[]
  className?: string
}

export function BlogTags({ tags, className }: BlogTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div
      className={cn('mt-12 flex items-center gap-3 border-t pt-8', className)}
    >
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="capitalize">
            <TagIcon className="mr-1 size-3" />
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
