const Divider = () => {
  return <div className="bg-border h-[0.5px] w-full" />
}

export function ContentDivider({ name }: { name: string }) {
  return (
    <div className="text-foreground flex w-full items-center">
      <Divider />
      <p className="text-muted-foreground w-96 text-center text-xs font-semibold">{name}</p>
      <Divider />
    </div>
  )
}
