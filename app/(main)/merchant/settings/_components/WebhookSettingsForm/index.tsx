'use client'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { ALL_STORES } from '@/stores/use-store-filter'

import { WebhookEndpointDialog } from './_components/WebhookEndpointDialog'
import { WebhookEndpointsTable } from './_components/WebhookEndpointsTable'
import { WebhookLogDetailDialog } from './_components/WebhookLogDetailDialog'
import { WebhookLogsTable } from './_components/WebhookLogsTable'
import { WebhookSignatureGuideCard } from './_components/WebhookSignatureGuideCard'
import { useWebhookSettings } from './_hooks/use-webhook-settings'

export function WebhookSettingsForm() {
  const {
    currentStore,
    store,
    selectedStoreId,
    endpoints,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingEndpoint,
    activeEndpointId,
    revealedSecrets,
    copiedId,
    logs,
    isLoadingLogs,
    isDeleting,
    isRegenerating,
    isTesting,
    testingEndpointId,
    resendingLogId,
    selectedLog,
    logDialogOpen,
    setLogDialogOpen,
    handleCopySecret,
    toggleRevealSecret,
    handleToggleActive,
    handleDelete,
    handleRegenerate,
    handleTestPing,
    handleResendLog,
    handleOpenAdd,
    handleOpenEdit,
    handleViewLog,
    getEventLabel,
    setSelectedEndpointId,
    t,
  } = useWebhookSettings()

  if (!selectedStoreId || selectedStoreId === ALL_STORES) {
    return (
      <ActionRequiredAlert
        title={t('storeRequiredTitle')}
        description={t('storeRequiredDesc')}
      />
    )
  }

  return (
    <div
      className="space-y-6"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <WebhookEndpointsTable
        endpoints={endpoints}
        isLoading={isLoading}
        activeEndpointId={activeEndpointId}
        revealedSecrets={revealedSecrets}
        copiedId={copiedId}
        testingEndpointId={testingEndpointId}
        isTesting={isTesting}
        isDeleting={isDeleting}
        isRegenerating={isRegenerating}
        onSelectEndpoint={setSelectedEndpointId}
        onOpenAdd={handleOpenAdd}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDelete}
        onRegenerate={handleRegenerate}
        onTestPing={handleTestPing}
        onCopySecret={handleCopySecret}
        onToggleRevealSecret={toggleRevealSecret}
        onToggleActive={handleToggleActive}
        getEventLabel={getEventLabel}
      />

      <WebhookSignatureGuideCard />

      <WebhookLogsTable
        endpoints={endpoints}
        activeEndpointId={activeEndpointId}
        logs={logs}
        isLoadingLogs={isLoadingLogs}
        isTesting={isTesting}
        resendingLogId={resendingLogId}
        onTestPing={handleTestPing}
        onViewLog={handleViewLog}
        onResendLog={handleResendLog}
        getEventLabel={getEventLabel}
      />

      <WebhookEndpointDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        endpoint={editingEndpoint}
      />

      <WebhookLogDetailDialog
        open={logDialogOpen}
        setOpen={setLogDialogOpen}
        log={selectedLog}
        onResend={handleResendLog}
        isResending={resendingLogId === selectedLog?.id}
      />
    </div>
  )
}
