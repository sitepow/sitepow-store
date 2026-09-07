import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'

export function FeaturePreviewSection({ slug }: { slug: string }) {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
        <Safari
          url={`app.sitepow.store/${slug}`}
          mode="simple"
          className="w-full"
        >
          <div className="size-full min-h-55 bg-neutral-200 transition-colors sm:min-h-105 dark:bg-neutral-800" />
        </Safari>
        <BorderBeam
          size={200}
          duration={8}
          colorFrom="#f97316"
          colorTo="#3b82f6"
          borderWidth={2}
        />
      </div>
    </div>
  )
}
