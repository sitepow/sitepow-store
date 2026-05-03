import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="max-w-2xl text-2xl leading-tight font-bold text-gray-900 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-4xl text-lg font-medium opacity-70 sm:text-2xl">
          {description}
        </p>
      )}
    </div>
  )
}
