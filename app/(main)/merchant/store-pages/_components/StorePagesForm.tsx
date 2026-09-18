'use client'

import { Tabs } from '@/components/ui/tabs'

import { StoreFooterSettingsTab } from './StoreFooterSettingsTab'
import { StoreMarkdownPageTab } from './StoreMarkdownPageTab'
import { StorePageAiDialog } from './StorePageAiDialog'
import { StorePagesSidebar } from './StorePagesSidebar'
import { StorePagesSkeleton } from './StorePagesSkeleton'
import { useStorePagesForm } from '../_hooks/use-store-pages-form'

interface StorePagesFormProps {
  storeId: string
}

export function StorePagesForm({ storeId }: StorePagesFormProps) {
  const {
    locale,
    currentStore,
    style,
    isLoading,
    isUpdating,
    activeTab,
    setActiveTab,
    contents,
    resetKeys,
    footerData,
    setFooterData,
    storeBaseUrl,
    pages,
    aiConfirmPage,
    setAiConfirmPage,
    aiEstimatedCost,
    isEstimatingAi,
    generatingPageId,
    handleAiTrigger,
    handleExecuteAi,
    handleContentChange,
    handleResetTemplate,
    handleSavePage,
    handleSaveFooter,
  } = useStorePagesForm({ storeId })

  if (isLoading) {
    return <StorePagesSkeleton />
  }

  return (
    <div style={style}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="flex flex-col gap-6 xl:flex-row"
      >
        <StorePagesSidebar pages={pages} />

        {pages.map((page) => (
          <StoreMarkdownPageTab
            key={page.id}
            page={page}
            content={contents[page.key]}
            editorKey={`${page.id}-${resetKeys[page.id] || 0}`}
            pageUrl={`${storeBaseUrl}${page.path}`}
            isPending={isUpdating}
            generatingPageId={generatingPageId}
            isEstimatingAi={isEstimatingAi}
            locale={locale}
            onContentChange={handleContentChange}
            onAiTrigger={handleAiTrigger}
            onResetTemplate={handleResetTemplate}
            onSavePage={handleSavePage}
          />
        ))}

        <StoreFooterSettingsTab
          footerData={footerData}
          storeBaseUrl={storeBaseUrl}
          storeName={currentStore?.name}
          isPending={isUpdating}
          onFooterDataChange={setFooterData}
          onSaveFooter={handleSaveFooter}
        />
      </Tabs>

      <StorePageAiDialog
        aiConfirmPage={aiConfirmPage}
        aiEstimatedCost={aiEstimatedCost}
        storeName={currentStore?.name}
        locale={locale}
        style={style}
        onClose={() => setAiConfirmPage(null)}
        onConfirm={handleExecuteAi}
      />
    </div>
  )
}
