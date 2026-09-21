const Divider = () => {
  return <div className="bg-border h-[0.5px] w-full" />
}

export function ContentDivider({ name }: { name: string }) {
  return (
    <div className="text-foreground flex w-full items-center">
      <Divider />
      <p className="w-96 text-center font-bold opacity-50">{name}</p>
      <Divider />
    </div>
  )
}
