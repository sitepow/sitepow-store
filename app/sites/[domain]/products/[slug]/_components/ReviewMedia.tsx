'use client'

import { useState } from 'react'

import { PlayIcon, X } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

type MediaItem = { type: 'video'; url: string } | { type: 'image'; url: string }

export function ReviewMedia({
  images,
  video,
}: {
  images: string[]
  video?: string | null
}) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {video && (
          <div
            onClick={() => setSelectedMedia({ type: 'video', url: video })}
            className="group border-primary relative size-20 cursor-pointer overflow-hidden border border-dashed p-1"
          >
            <video
              src={video}
              className="size-full object-cover"
              preload="metadata"
              muted
            />
            <div className="absolute inset-1 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
              <PlayIcon className="size-6 fill-white text-white" />
            </div>
          </div>
        )}
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setSelectedMedia({ type: 'image', url: img })}
            className="border-primary size-20 cursor-pointer overflow-hidden border border-dashed p-1 transition-opacity hover:opacity-80"
          >
            <img src={img} alt="review" className="size-full object-cover" />
          </div>
        ))}
      </div>
      <Dialog
        open={!!selectedMedia}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="w-[90vw] max-w-2xl border-none bg-transparent p-0 shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-gray-50 md:aspect-4/3">
            <DialogClose className="absolute top-3 right-3 z-50 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80">
              <X className="size-5" />
            </DialogClose>
            {selectedMedia?.type === 'video' && (
              <video
                key={selectedMedia.url}
                src={selectedMedia.url}
                className="size-full object-contain"
                controls
                autoPlay
              />
            )}
            {selectedMedia?.type === 'image' && (
              <img
                key={selectedMedia.url}
                src={selectedMedia.url}
                alt="preview"
                className="size-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
