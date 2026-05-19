'use client'

import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { IconEdit, IconExternalLink } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { PLAN_DETAILS, PlanType } from './planDetails'

interface Store {
  id: string
  name: string
  slug: string
  plan: PlanType
  status: string
  createdAt: string
}

interface StoreTableProps {
  stores: Store[]
}

export function StoreTable({ stores }: StoreTableProps) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ร้านค้า</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>แพลน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่เปิดใช้งาน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const isActive = store.status === 'ACTIVE'
              return (
                <TableRow key={store.id}>
                  <TableCell>
                    <span className="font-medium">{store.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <span>myshop.com/{store.slug}</span>
                      <a
                        href={`https://myshop.com/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        <IconExternalLink size={18} />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {PLAN_DETAILS[store.plan].name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'เปิดใช้งานอยู่' : 'ปิดการใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell>{store.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon-lg">
                      <IconEdit />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <StorePagination />
    </>
  )
}
