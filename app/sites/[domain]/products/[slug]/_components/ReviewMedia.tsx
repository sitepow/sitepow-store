import { PlayIcon } from 'lucide-react'

export function ReviewMedia({
  images,
  video,
}: {
  images: string[]
  video?: string | null
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {video && (
        <div className="group relative size-24 cursor-pointer overflow-hidden rounded-xl bg-slate-100">
          <div className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/40">
            <PlayIcon className="size-7 fill-white text-white" />
          </div>
        </div>
      )}

      {images.map((img, i) => (
        <div key={i} className="size-24 overflow-hidden rounded-xl bg-slate-50">
          {/* <img src={img} alt="review" className="size-full object-cover" /> */}
        </div>
      ))}
    </div>
  )
}
