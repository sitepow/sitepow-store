'use client'

import React, { useState } from 'react'

import {
  IconArrowRight,
  IconBuildingStore,
  IconEdit,
  IconHierarchy,
  IconInbox,
  IconLoader2,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Branch {
  id: string
  storeId: string
  name: string
  taxId: string | null
  phone: string | null
  address: string | null
  isActive: boolean
  staffCount: number
  totalStockItems: number
}

const MOCK_BRANCHES_DATA = [
  {
    id: 'br-1',
    storeId: 'store-1',
    name: 'สาขาสยามสแควร์ (HQ)',
    taxId: '0105566000121',
    phone: '02-111-2222',
    address:
      '999 อาคารสยามพารากอน ชั้น 3 ถนนพระรามที่ 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    isActive: true,
    staffCount: 8,
    totalStockItems: 1420,
  },
  {
    id: 'br-2',
    storeId: 'store-1',
    name: 'สาขาอารีย์',
    taxId: '0105566000121',
    phone: '02-333-4444',
    address:
      '11/1 โครงการเดอะพรีเซ้นต์ ซอยอารีย์ 1 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กรุงเทพมหานคร 10400',
    isActive: true,
    staffCount: 3,
    totalStockItems: 450,
  },
  {
    id: 'br-3',
    storeId: 'store-3',
    name: 'สาขาเซ็นทรัลเวิลด์',
    taxId: '0109999888777',
    phone: '02-555-6666',
    address:
      '4/4 ศูนย์การค้าเซ็นทรัลเวิลด์ ชั้น 4 ถนนราชดำริ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    isActive: true,
    staffCount: 12,
    totalStockItems: 3800,
  },
]

export function OrganizationBranchesContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES_DATA)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [branchName, setBranchName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const filteredBranches = branches.filter(
    (branch) => branch.storeId === selectedStoreId,
  )

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchName) return

    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `br_${Math.random().toString(36).substring(2, 11)}`

      const newBranch = {
        id: generatedId,
        storeId: selectedStoreId,
        name: branchName,
        taxId: taxId || null,
        phone: phone || null,
        address: address || null,
        isActive: true,
        staffCount: 0,
        totalStockItems: 0,
      }

      setBranches([...branches, newBranch])

      setBranchName('')
      setTaxId('')
      setPhone('')
      setAddress('')
      setIsSubmitting(false)
      setIsDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconHierarchy}
        title="การจัดการสาขา"
        description="บริหารจัดการที่ตั้งสาขาและคลังหน้าร้าน เพื่อใช้ควบคุมสิทธิ์พนักงานและกระจายสต็อกสินค้าคงคลังให้แม่นยำ"
        endContent={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-full sm:w-60">
                <SelectValue placeholder="เลือกร้านค้าเพื่อดูสาขา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store-1">
                  เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                </SelectItem>
                <SelectItem value="store-2">
                  ร้านกาแฟหอมกรุ่น Cafe & Bakery
                </SelectItem>
                <SelectItem value="store-3">Gadget & IT Accessories</SelectItem>
              </SelectContent>
            </Select>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => !isSubmitting && setIsDialogOpen(open)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="w-full gap-1.5 px-4 text-xs font-medium sm:w-auto"
                >
                  <IconPlus size={16} />
                  เพิ่มสาขาใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
                    <IconBuildingStore size={20} className="text-primary" />
                    เพิ่มข้อมูลสาขาใหม่
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    ระบุรายละเอียดสถานที่ตั้งและเลขผู้เสียภาษีประจำสาขา
                    เพื่อใช้ประกอบการเปิดสิทธิ์การขายบนระบบ POS
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleCreateBranch}
                  className="space-y-4 pt-3 text-xs"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="br-name"
                      className="text-foreground font-medium"
                    >
                      ชื่อสาขา / จุดจำหน่าย{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="br-name"
                      placeholder="เช่น สาขาเซ็นทรัลลาดพร้าว, สาขาอโศกทาวเวอร์"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="br-tax"
                      className="text-foreground font-medium"
                    >
                      เลขประจำตัวผู้เสียภาษีประจำสาขา (ถ้ามี)
                    </Label>
                    <Input
                      id="br-tax"
                      maxLength={13}
                      placeholder="ระบุเลข 13 หลัก"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      disabled={isSubmitting}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="br-phone"
                      className="text-foreground font-medium"
                    >
                      เบอร์โทรศัพท์ติดต่อประจำหน้าร้าน
                    </Label>
                    <Input
                      id="br-phone"
                      placeholder="เช่น 02-xxx-xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="br-address"
                      className="text-foreground font-medium"
                    >
                      ที่อยู่สาขาอย่างละเอียด
                    </Label>
                    <Textarea
                      id="br-address"
                      placeholder="ระบุเลขที่ตั้ง อาคาร ชั้น ถนน แขวง เขต และรหัสไปรษณีย์"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={isSubmitting}
                      className="leading-relaxed"
                    />
                  </div>

                  <DialogFooter className="gap-2 pt-3 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isSubmitting}
                      className="px-4 text-xs font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <IconLoader2
                            size={14}
                            className="mr-1 animate-spin"
                          />{' '}
                          กำลังสร้างสาขา...
                        </>
                      ) : (
                        'บันทึกข้อมูลสาขา'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {filteredBranches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
          <div className="text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full border">
            <IconInbox size={20} />
          </div>
          <span className="text-foreground mt-3 block text-xs font-medium">
            ยังไม่มีข้อมูลสาขาในแบรนด์นี้
          </span>
          <span className="text-muted-foreground mt-1 block max-w-xs px-4 text-[11px]">
            ระบบจะสร้างสาขาหลักสำนักงานใหญ่ (HQ) ให้เป็นค่าเริ่มต้นโดยอัตโนมัติ
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredBranches.map((branch) => (
            <Card
              key={branch.id}
              className="group hover:border-input relative flex flex-col justify-between overflow-hidden border-solid transition-all duration-200"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"></span>
                        <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
                      </span>
                      <span className="group-hover:text-primary line-clamp-1 transition-colors">
                        {branch.name}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px]">
                      <span>ID: {branch.id}</span>
                      {branch.taxId && (
                        <>
                          <span className="opacity-40">|</span>
                          <span>TAX: {branch.taxId}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>

                  <Badge
                    variant="default"
                    className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium tracking-wide shadow-none select-none"
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="text-muted-foreground grow space-y-4 p-4 pt-2 text-xs">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <IconMapPin
                      size={14}
                      className="mt-0.5 shrink-0 opacity-60"
                    />
                    <span className="text-foreground/90 line-clamp-2 text-[11px] leading-relaxed">
                      {branch.address || 'ยังไม่ได้กำหนดข้อมูลที่อยู่ตามกฎหมาย'}
                    </span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <IconPhone size={14} className="shrink-0 opacity-60" />
                      <span className="text-foreground/80 font-mono text-[11px]">
                        {branch.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-muted/5 flex items-center gap-5 rounded border-t p-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <IconUsers size={14} className="text-primary opacity-60" />
                    <span>ทีมงาน:</span>
                    <span className="text-primary font-mono font-bold">
                      {branch.staffCount}
                    </span>
                    <span className="text-[10px] opacity-70">คน</span>
                  </div>

                  <div className="bg-border h-3 w-px" />

                  <div className="flex items-center gap-1.5">
                    <IconPackage
                      size={14}
                      className="text-primary opacity-60"
                    />
                    <span>คลังสินค้า:</span>
                    <span className="text-primary font-mono font-bold">
                      {branch.totalStockItems.toLocaleString()}
                    </span>
                    <span className="text-[10px] opacity-70">ชิ้น</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/20 flex items-center justify-end gap-2 border-t p-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-7 gap-1 rounded px-2.5 text-[11px] font-medium"
                >
                  <IconEdit size={13} />
                  <span>ตั้งค่า</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 rounded px-3 text-[11px] font-medium"
                >
                  <span>จัดการคลัง</span>
                  <IconArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
