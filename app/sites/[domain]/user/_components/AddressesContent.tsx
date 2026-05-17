'use client'

import React, { useState } from 'react'

import {
  IconBriefcase,
  IconCheck,
  IconCircleCheck,
  IconEdit,
  IconHome,
  IconMapPin,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

export function AddressesContent() {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES)
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
      const newAddress = {
        id: `addr-${Math.random().toString()}`,
        title,
        type: 'HOME',
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
    <div className="space-y-6">
      <PageTabHeader
        icon={IconMapPin}
        title="ที่อยู่จัดส่งของฉัน"
        description="บันทึกสมุดที่อยู่รับสินค้า
            เพื่อความสะดวกและรวดเร็วในการกรอกฟอร์มปลายทางตอนสั่งซื้อผ่านหน้า
            Sale Page"
        endContent={
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-9 shrink-0 gap-1 text-xs">
                <IconPlus size={16} />
                เพิ่มที่อยู่ใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <IconMapPin className="text-primary" size={18} />
                  {editingAddress
                    ? 'แก้ไขข้อมูลที่อยู่จัดส่ง'
                    : 'เพิ่มที่อยู่จัดส่งใหม่'}
                </DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลสถานที่
                  และช่องทางติดต่อของผู้รับปลายทางให้ชัดเจนเพื่อป้องกันพัสดุตีกลับ
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="ad-title" className="font-semibold">
                    ป้ายชื่อเรียกที่อยู่
                  </Label>
                  <Input
                    id="ad-title"
                    placeholder="เช่น บ้านหลัก, คอนโด, ออฟฟิศพญาไท, บ้านแม่"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-receiver" className="font-semibold">
                      ชื่อ-นามสกุล ผู้รับ
                    </Label>
                    <Input
                      id="ad-receiver"
                      placeholder="ชื่อผู้รับสินค้า"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-phone" className="font-semibold">
                      เบอร์โทรศัพท์ติดต่อ
                    </Label>
                    <Input
                      id="ad-phone"
                      placeholder="เบอร์โทรศัพท์"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-details" className="font-semibold">
                    ที่อยู่โดยละเอียด
                  </Label>
                  <Textarea
                    id="ad-details"
                    placeholder="บ้านเลขที่, ถนน, ซอย, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                    className="text-xs leading-relaxed"
                  />
                </div>

                <DialogFooter className="gap-2 pt-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" size="sm">
                    บันทึกข้อมูล
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {addresses.length === 0 ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-xs">
          คุณยังไม่มีข้อมูลที่อยู่จัดส่งในระบบ
          สามารถกดเพิ่มที่อยู่ใหม่ได้จากปุ่มด้านบนครับ
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`relative flex flex-col justify-between overflow-hidden border-2 transition-shadow hover:shadow-sm ${
                addr.isDefault
                  ? 'border-primary/50 bg-primary/1'
                  : 'border-muted'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {addr.title.includes('ออฟฟิศ') ||
                    addr.title.includes('ทำงาน') ? (
                      <IconBriefcase
                        size={16}
                        className="text-muted-foreground"
                      />
                    ) : (
                      <IconHome size={16} className="text-muted-foreground" />
                    )}
                    <CardTitle className="text-foreground text-xs font-bold">
                      {addr.title}
                    </CardTitle>
                  </div>

                  {addr.isDefault && (
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary gap-0.5 border-none px-2 py-0.5 text-[10px]">
                      <IconCircleCheck
                        size={12}
                        className="fill-primary-foreground text-primary"
                      />{' '}
                      ที่อยู่เริ่มต้น
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="text-muted-foreground grow space-y-3 pb-4 text-xs">
                <p className="text-foreground line-clamp-3 min-h-12 leading-relaxed">
                  {addr.details}
                </p>

                <div className="grid grid-cols-2 gap-2 border-t pt-2 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground block font-sans text-[9px] tracking-wider uppercase">
                      ผู้รับสินค้า
                    </span>
                    <span className="text-foreground font-sans font-medium">
                      {addr.receiverName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-sans text-[9px] tracking-wider uppercase">
                      เบอร์ติดต่อ
                    </span>
                    <span className="text-foreground">{addr.phone}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/20 flex items-center justify-between gap-2 border-t px-4 py-2">
                <div>
                  {!addr.isDefault ? (
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary h-7 gap-0.5 px-2 text-[11px]"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      ตั้งเป็นที่อยู่หลัก
                    </Button>
                  ) : (
                    <span className="text-primary flex items-center gap-0.5 text-[10px] font-medium">
                      <IconCheck size={12} /> เลือกใช้งานเป็นที่แรกเสมอ
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                    onClick={() => handleOpenEdit(addr)}
                  >
                    <IconEdit size={14} />
                  </Button>
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
