import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function ChatAIToggle({
  enabled,
  onToggle,
}: {
  enabled?: boolean
  onToggle: (checked: boolean) => void
}) {
  return (
    <div className="bg-foreground/5 flex items-center justify-between border-b p-3">
      <span className="text-foreground text-xs font-semibold">
        ตั้งค่า AI สำหรับลูกค้ารายนี้
      </span>
      <div className="flex items-center space-x-2">
        <Label htmlFor="ai-mode" className="text-xs">
          เปิดใช้งาน AI
        </Label>
        <Switch id="ai-mode" checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  )
}
