'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import type {
  RestaurantTableItem,
  TableZoneWithCount,
} from '@/types/restaurant'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TableDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    tableNumber: string
    seats: number
    zoneId?: string | null
  }) => void
  isSaving: boolean
  editingTable: RestaurantTableItem | null
  zones: TableZoneWithCount[]
  defaultZoneId?: string
}

export function TableDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
  editingTable,
  zones,
  defaultZoneId,
}: TableDialogProps) {
  const t = useTranslations('merchant.tables')
  const [tableNumber, setTableNumber] = useState('')
  const [seats, setSeats] = useState(4)
  const [targetZoneId, setTargetZoneId] = useState('NONE')

  useEffect(() => {
    if (editingTable) {
      setTableNumber(editingTable.tableNumber)
      setSeats(editingTable.seats)
      setTargetZoneId(editingTable.zoneId || 'NONE')
    } else {
      setTableNumber('')
      setSeats(4)
      setTargetZoneId(
        defaultZoneId && defaultZoneId !== 'ALL' && defaultZoneId !== 'NO_ZONE'
          ? defaultZoneId
          : 'NONE',
      )
    }
  }, [editingTable, defaultZoneId, isOpen])

  const handleSubmit = () => {
    if (!tableNumber.trim()) {
      toast.error(t('validation.requireTableNumber'))
      return
    }
    onSave({
      tableNumber: tableNumber.trim(),
      seats: Number(seats),
      zoneId: targetZoneId === 'NONE' ? null : targetZoneId,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTable
              ? t('dialogs.editTableTitle')
              : t('dialogs.addTableTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tableNumber">{t('dialogs.tableNumberLabel')}</Label>
            <Input
              id="tableNumber"
              placeholder={t('dialogs.tableNumberPlaceholder')}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">{t('dialogs.seatsLabel')}</Label>
            <Input
              id="seats"
              type="number"
              min={1}
              max={50}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('dialogs.zoneLabel')}</Label>
            <Select value={targetZoneId} onValueChange={setTargetZoneId}>
              <SelectTrigger>
                <SelectValue placeholder={t('dialogs.zonePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">
                  {t('dialogs.noZoneOption')}
                </SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
