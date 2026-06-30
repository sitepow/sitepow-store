interface TableImageProps {
  imageUrl?: string
}

export function TableImage({ imageUrl }: TableImageProps) {
  return <div className="bg-foreground/5 size-32 rounded-xl" />
}
