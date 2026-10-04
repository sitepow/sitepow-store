'use client'

import Link from 'next/link'

import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit, IconPlus } from '@tabler/icons-react'
import { ArrowLeftIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { CreateBlogForm } from './CreateBlogForm'

interface BlogCreateClientProps {
  blogId?: string
}

export function BlogCreateClient({ blogId }: BlogCreateClientProps) {
  const { selectedStoreId } = useStoreFilter()
  const isMounted = useIsMounted()

  if (!isMounted) {
    return null
  }

  const isEditMode = Boolean(blogId)

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={isEditMode ? IconEdit : IconPlus}
        title={isEditMode ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}
        description="จัดการเนื้อหาบทความ ภาพปก และการแสดงผลบทความในบล็อก"
        endContent={
          <div className="flex flex-wrap items-end gap-3">
            <Button asChild variant="outline">
              <Link href="/merchant/blog">
                <ArrowLeftIcon className="mr-1 size-4" /> ย้อนกลับ
              </Link>
            </Button>
            <StoreSelectField />
          </div>
        }
      />
      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
      {selectedStoreId !== ALL_STORES && <CreateBlogForm blogId={blogId} />}
    </Sidebar>
  )
}
