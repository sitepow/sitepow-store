'use client'

import { useState } from 'react'

import {
  useCreateReview,
  useUpdateReview,
} from '@/actions/hooks/storefront/review'
import {
  IconStar,
  IconStarFilled,
  IconUpload,
  IconX,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface ReviewFormDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id?: string
    rating: number
    comment: string
    images?: string[]
  }
  targetInfo?: {
    storeId: string
    productId: string
    variantId: string
    orderId?: string
    productTitle?: string
    productImage?: string
  }
}

export function ReviewFormDialog({
  isOpen,
  onClose,
  initialData,
  targetInfo,
}: ReviewFormDialogProps) {
  const isEditing = !!initialData?.id

  const [rating, setRating] = useState(initialData?.rating || 5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(initialData?.comment || '')
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [error, setError] = useState('')

  const createMutation = useCreateReview()
  const updateMutation = useUpdateReview()

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages].slice(0, 5))
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!comment.trim()) {
      setError('กรุณากรอกความคิดเห็น')
      return
    }

    if (isEditing && initialData?.id) {
      updateMutation.mutate(
        {
          id: initialData.id,
          input: {
            rating,
            comment,
            images,
          },
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              onClose()
            }
          },
        },
      )
    } else if (targetInfo) {
      createMutation.mutate(
        {
          storeId: targetInfo.storeId,
          productId: targetInfo.productId,
          variantId: targetInfo.variantId,
          orderId: targetInfo.orderId,
          rating,
          comment,
          images,
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              onClose()
            }
          },
        },
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไขรีวิวสินค้า' : 'เขียนรีวิวสินค้า'}
          </DialogTitle>
        </DialogHeader>
        {targetInfo?.productTitle && (
          <div className="flex items-center gap-3 border-b pb-3">
            {targetInfo.productImage && (
              <img
                src={targetInfo.productImage}
                alt={targetInfo.productTitle}
                className="h-12 w-12 rounded-md object-cover"
              />
            )}
            <span className="line-clamp-2 text-sm font-medium">
              {targetInfo.productTitle}
            </span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center gap-1 py-2">
            <span className="text-muted-foreground text-sm">
              ให้คะแนนสินค้า
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating)
                return (
                  <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    {isFilled ? (
                      <IconStarFilled className="h-8 w-8 text-amber-400" />
                    ) : (
                      <IconStar className="h-8 w-8 text-gray-300" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">ความคิดเห็นของคุณ</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="แบ่งปันความประทับใจเกี่ยวกับสินค้าชิ้นนี้..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              รูปภาพประกอบ (สูงสุด 5 รูป)
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-16 w-16 overflow-hidden rounded-md border"
                >
                  <img
                    src={img}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="text-muted-foreground flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-xs hover:bg-gray-50">
                  <IconUpload className="h-5 w-5" />
                  <span>เพิ่มรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'กำลังบันทึก...'
                : isEditing
                  ? 'บันทึกการแก้ไข'
                  : 'ส่งรีวิว'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
