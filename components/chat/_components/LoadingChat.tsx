import { Spinner } from '@/components/ui/spinner'

export function LoadingChat() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm">
      <Spinner />
      กำลังโหลด...
    </div>
  )
}
