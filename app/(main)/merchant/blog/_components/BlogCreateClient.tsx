'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit, IconPlus } from '@tabler/icons-react'
import { ArrowLeftIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { CreateBlogForm } from './CreateBlogForm'

interface BlogCreateClientProps {
  blogId?: string
}

export function BlogCreateClient({ blogId }: BlogCreateClientProps) {
  const t = useTranslations('merchant.blog')
  const tCommon = useTranslations('common.actions')
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
        title={isEditMode ? t('editBlog') : t('addBlog')}
        description={t('formDescription')}
        endContent={
          <div className="flex flex-wrap items-end gap-3">
            <Button asChild variant="outline">
              <Link href="/merchant/blog">
                <ArrowLeftIcon className="mr-1 size-4" /> {tCommon('back')}
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
