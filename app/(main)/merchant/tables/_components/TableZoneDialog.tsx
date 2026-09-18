'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TableZoneDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  isSaving: boolean
}

export function TableZoneDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: TableZoneDialogProps) {
  const t = useTranslations('merchant.tables')
  const [zoneName, setZoneName] = useState('')

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setZoneName('')
      onClose()
    }
  }

  const handleSubmit = () => {
    if (!zoneName.trim()) {
      toast.error(t('validation.requireZoneName'))
      return
    }
    onSave(zoneName.trim())
    setZoneName('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('dialogs.addZoneTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="zoneName">{t('dialogs.zoneNameLabel')}</Label>
            <Input
              id="zoneName"
              placeholder={t('dialogs.zoneNamePlaceholder')}
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t('dialogs.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? t('dialogs.saving') : t('dialogs.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
