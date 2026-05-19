'use client'

import { useState } from 'react'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconMapPin, IconPlus } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { AddressForm } from './_components/AddressForm'
import { AddressTable } from './_components/AddressTable'

export interface UserAddress {
  id: string
  title: string
  type: 'HOME' | 'WORK' | string
  receiverName: string
  phone: string
  details: string
  isDefault: boolean
}

const MOCK_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-1',
    title: 'คอนโด (จัดส่งหลัก)',
    type: 'HOME',
    receiverName: 'สมชาย ใจดี',
    phone: '081-234-5678',
    details:
      '123/45 หมู่บ้านสุขสบาย ซอย 5 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    isDefault: true,
  },
  {
    id: 'addr-2',
    title: 'ที่ทำงาน / ออฟฟิศ',
    type: 'WORK',
    receiverName: 'สมชาย ใจดี (ฝากป้อมยาม)',
    phone: '081-234-5678',
    details:
      'อาคารพญาไททาวเวอร์ ชั้น 12 ห้อง 1204 ถนนพญาไท แขวงถนนพญาไท เขตราชเทวี กรุงเทพมหานคร 10400',
    isDefault: false,
  },
]

export default function StoreUserAddressesPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>(MOCK_ADDRESSES)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)

  const [title, setTitle] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [phone, setPhone] = useState('')
  const [details, setDetails] = useState('')

  const resetForm = () => {
    setTitle('')
    setReceiverName('')
    setPhone('')
    setDetails('')
    setEditingAddress(null)
  }

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr)
    setTitle(addr.title)
    setReceiverName(addr.receiverName)
    setPhone(addr.phone)
    setDetails(addr.details)
    setIsDialogOpen(true)
  }

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    setAddresses(updated)
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !receiverName || !phone || !details) return

    if (editingAddress) {
      const updated = addresses.map((addr) => {
        if (addr.id === editingAddress.id) {
          return { ...addr, title, receiverName, phone, details }
        }
        return addr
      })
      setAddresses(updated)
    } else {
      const newAddress: UserAddress = {
        id: `addr-${Math.random().toString()}`,
        type: 'HOME',
        title,
        receiverName,
        phone,
        details,
        isDefault: addresses.length === 0,
      }
      setAddresses([...addresses, newAddress])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  return (
    <DashboardSidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconMapPin}
        title="ที่อยู่จัดส่งของฉัน"
        description="บันทึกสมุดที่อยู่รับสินค้า เพื่อความสะดวกและรวดเร็วในการกรอกฟอร์มปลายทางตอนสั่งซื้อผ่านหน้า Sale Page"
        endContent={
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <IconPlus size={16} /> เพิ่มที่อยู่ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAddress
                    ? 'แก้ไขข้อมูลที่อยู่จัดส่ง'
                    : 'เพิ่มที่อยู่จัดส่งใหม่'}
                </DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลสถานที่
                  และช่องทางติดต่อของผู้รับปลายทางให้ชัดเจนเพื่อป้องกันพัสดุตีกลับ
                </DialogDescription>
              </DialogHeader>
              <AddressForm
                title={title}
                receiverName={receiverName}
                phone={phone}
                details={details}
                onTitleChange={setTitle}
                onReceiverNameChange={setReceiverName}
                onPhoneChange={setPhone}
                onDetailsChange={setDetails}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />
      <AddressTable
        addresses={addresses}
        onEdit={handleOpenEdit}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteAddress}
      />
    </DashboardSidebar>
  )
}
