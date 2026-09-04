import { HeadphonesIcon } from 'lucide-react'

export function SupportContact() {
  return (
    <div className="text-muted-foreground mx-auto flex flex-col items-center justify-center gap-1 text-xs sm:flex-row sm:gap-3">
      <div className="flex items-center gap-1.5">
        <HeadphonesIcon className="text-primary size-3.5 shrink-0" />
        <span>ติดต่อฝ่ายบริการ Sitepow:</span>
        <a
          href="tel:0647070943"
          className="text-foreground hover:text-primary font-semibold transition-colors hover:underline"
        >
          06-4707-0943
        </a>
      </div>
      <span className="text-border hidden sm:inline">•</span>
      <p className="opacity-75">วันจันทร์ - ศุกร์ เวลา 8.00 - 17.00 น.</p>
    </div>
  )
}
