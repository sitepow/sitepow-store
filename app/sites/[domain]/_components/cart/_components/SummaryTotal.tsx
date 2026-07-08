export function SummaryTotal({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between text-lg font-bold">
      <span>{label}</span>
      <span className="text-(--brand-color)">{value}</span>
    </div>
  )
}
