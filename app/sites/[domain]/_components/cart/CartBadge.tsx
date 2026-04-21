interface CartBadgeProps {
  total: number
}

export function CartBadge({ total }: CartBadgeProps) {
  return (
    <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[10px]">
      {total > 99 ? '+99' : total}
    </span>
  )
}
