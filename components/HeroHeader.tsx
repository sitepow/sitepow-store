import { ReactNode } from 'react'

interface HeroHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
}

export function HeroHeader({ title, subtitle }: HeroHeaderProps) {
  return (
    <div className="text-foreground flex flex-col items-center gap-4">
      <h1 className="max-w-2xl text-2xl leading-tight font-bold sm:text-4xl">
        {title}
      </h1>

      <h2 className="-mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xl font-medium opacity-70 sm:text-2xl">
        {subtitle}
      </h2>
    </div>
  )
}
