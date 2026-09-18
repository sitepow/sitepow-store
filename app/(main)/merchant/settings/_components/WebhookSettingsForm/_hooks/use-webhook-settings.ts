'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useLocale, useTranslations } from 'next-intl'

import {
  useDeleteWebhookEndpoint,
  useRegenerateWebhookSecret,
  useResendWebhookLog,
  useStoreWebhookEndpoints,
  useTestWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useWebhookLogs,
} from '@/actions/hooks/webhook'
import { StoreWebhookEndpointItem } from '@/actions/webhook'
import { getWebhookEvents } from '@/constants/webhook'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreFilter } from '@/stores/use-store-filter'

import { WebhookLogItem } from '../_components/WebhookLogDetailDialog'

export function useWebhookSettings() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.webhook')
  const tEvents = useTranslations('merchant.settings.webhook.events')
  const locale = useLocale()
  const fallbackEvents = getWebhookEvents(locale)

  const getEventLabel = (eventId: string) => {
    const camelKey = eventId.replace(/\.([a-z])/g, (_, l) => l.toUpperCase())
    if (tEvents.has(`${eventId}.label` as Parameters<typeof tEvents.has>[0])) {
      return tEvents(`${eventId}.label` as Parameters<typeof tEvents>[0])
    }
    if (tEvents.has(`${camelKey}.label` as Parameters<typeof tEvents.has>[0])) {
      return tEvents(`${camelKey}.label` as Parameters<typeof tEvents>[0])
    }
    const fallback = fallbackEvents.find((e) => e.id === eventId)
    return fallback?.label || eventId
  }

  const { selectedStoreId } = useStoreFilter()
  const { data: endpoints = [], isLoading } =
    useStoreWebhookEndpoints(selectedStoreId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] =
    useState<StoreWebhookEndpointItem | null>(null)

  const [selectedEndpointId, setSelectedEndpointId] = useState<
    string | undefined
  >()
  const [revealedSecrets, setRevealedSecrets] = useState<
    Record<string, boolean>
  >({})
  const { copy } = useCopyToClipboard()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [selectedLog, setSelectedLog] = useState<WebhookLogItem | null>(null)
  const [logDialogOpen, setLogDialogOpen] = useState(false)

  const activeEndpointId = selectedEndpointId || endpoints[0]?.id

  const { data: logs = [], isLoading: isLoadingLogs } =
    useWebhookLogs(activeEndpointId)

  const { mutate: deleteEndpoint, isPending: isDeleting } =
    useDeleteWebhookEndpoint()
  const { mutate: updateEndpoint } = useUpdateWebhookEndpoint()
  const { mutate: regenerateSecret, isPending: isRegenerating } =
    useRegenerateWebhookSecret()
  const { mutate: testPing, isPending: isTesting } = useTestWebhookEndpoint()
  const { mutate: resendLog } = useResendWebhookLog()

  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(
    null,
  )
  const [resendingLogId, setResendingLogId] = useState<string | null>(null)

  const handleCopySecret = (id: string, secret: string) => {
    copy(secret)
    setCopiedId(id)
    toast.success(t('copySecretSuccess'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleRevealSecret = (id: string) => {
    setRevealedSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleToggleActive = (
    endpoint: StoreWebhookEndpointItem,
    checked: boolean,
  ) => {
    updateEndpoint({
      endpointId: endpoint.id,
      storeId: selectedStoreId!,
      data: {
        url: endpoint.url,
        description: endpoint.description,
        events: endpoint.events,
        isActive: checked,
      },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirm'))) {
      deleteEndpoint(id, {
        onSuccess: (res) => {
          if (res.success) {
            if (selectedEndpointId === id) {
              setSelectedEndpointId(undefined)
            }
          }
        },
      })
    }
  }

  const handleRegenerate = (id: string) => {
    if (confirm(t('regenerateConfirm'))) {
      regenerateSecret(id)
    }
  }

  const handleTestPing = (id: string) => {
    setTestingEndpointId(id)
    testPing(id, {
      onSuccess: () => {
        setTestingEndpointId(null)
      },
      onError: () => {
        setTestingEndpointId(null)
      },
    })
  }

  const handleResendLog = (logId: string) => {
    setResendingLogId(logId)
    resendLog(logId, {
      onSuccess: () => {
        setResendingLogId(null)
      },
      onError: () => {
        setResendingLogId(null)
      },
    })
  }

  const handleOpenAdd = () => {
    setEditingEndpoint(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (endpoint: StoreWebhookEndpointItem) => {
    setEditingEndpoint(endpoint)
    setDialogOpen(true)
  }

  const handleViewLog = (log: WebhookLogItem) => {
    setSelectedLog(log)
    setLogDialogOpen(true)
  }

  return {
    currentStore,
    store,
    selectedStoreId,
    endpoints,
    isLoading,
    dialogOpen,
    setDialogOpen,
    editingEndpoint,
    selectedEndpointId,
    setSelectedEndpointId,
    activeEndpointId,
    revealedSecrets,
    copiedId,
    logs: logs as WebhookLogItem[],
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
    t,
  }
}
