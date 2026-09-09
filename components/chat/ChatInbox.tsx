'use client'

import { useMemo, useState } from 'react'

import {
  useCustomerConversations,
  useMarkAsRead,
  useSupportConversations,
  useToggleConversationAi,
} from '@/actions/hooks/chat'
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconFilter,
  IconInfoCircle,
  IconMail,
  IconMessages,
  IconPhone,
  IconRefresh,
  IconSearch,
  IconSparkles,
  IconX,
} from '@tabler/icons-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import { ChatWindow } from './_components/ChatWindow'
import {
  ConversationItem,
  ConversationItemData,
} from './_components/ConversationItem'

type FilterType = 'all' | 'unread' | 'ai' | 'manual'

interface ChatInboxProps {
  mode?: 'merchant' | 'support' | 'customer'
  storeId?: string
  currentUserId: string
}

export function ChatInbox({
  mode = 'merchant',
  storeId,
  currentUserId,
}: ChatInboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [showCustomerPanel, setShowCustomerPanel] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const isCustomerMode = mode === 'customer'

  const {
    data: supportData,
    isLoading: isSupportLoading,
    refetch: refetchSupport,
  } = useSupportConversations(!isCustomerMode, storeId)

  const {
    data: customerData,
    isLoading: isCustomerLoading,
    refetch: refetchCustomer,
  } = useCustomerConversations()

  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: toggleAi, isPending: isTogglingAi } =
    useToggleConversationAi()

  const rawConversations: ConversationItemData[] = useMemo(() => {
    if (isCustomerMode) {
      return (
        customerData?.success && customerData.data ? customerData.data : []
      ) as ConversationItemData[]
    }
    return (
      supportData?.success && supportData.data ? supportData.data : []
    ) as ConversationItemData[]
  }, [isCustomerMode, customerData, supportData])

  const isLoading = isCustomerMode ? isCustomerLoading : isSupportLoading

  // Calculate unread count
  const totalUnread = useMemo(() => {
    return rawConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  }, [rawConversations])

  // Filter conversations based on search and status
  const filteredConversations = useMemo(() => {
    return rawConversations.filter((c) => {
      const name = (c.merchantName || c.name || '').toLowerCase()
      const email = (c.customerEmail || '').toLowerCase()
      const message = (c.lastMessage || '').toLowerCase()
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        message.includes(query)

      if (!matchesSearch) return false

      if (filterType === 'unread') return c.unreadCount > 0
      if (filterType === 'ai') return !!c.isAiEnabled
      if (filterType === 'manual') return !c.isAiEnabled
      return true
    })
  }, [rawConversations, searchQuery, filterType])

  const selectedConv = useMemo(() => {
    return rawConversations.find((c) => c.id === selectedId) || null
  }, [rawConversations, selectedId])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    markAsRead(id)
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleToggleAi = (checked: boolean) => {
    if (!selectedId) return
    toggleAi({
      conversationId: selectedId,
      enabled: checked,
    })
  }

  const handleRefetch = () => {
    if (isCustomerMode) {
      refetchCustomer()
    } else {
      refetchSupport()
    }
  }

  const customerName =
    selectedConv?.merchantName || selectedConv?.name || 'ลูกค้าทั่วไป'
  const customerAvatar =
    selectedConv?.customerImage || selectedConv?.storeLogo || null

  return (
    <TooltipProvider>
      <Card className="border-border/60 flex h-[calc(100vh-12rem)] min-h-[550px] w-full overflow-hidden p-0 shadow-sm">
        {/* ================= COLUMN 1: CONVERSATIONS LIST ================= */}
        <div
          className={cn(
            'border-border/60 flex w-full flex-col border-r md:w-80 lg:w-96',
            selectedId ? 'hidden md:flex' : 'flex',
          )}
        >
          {/* Header & Stats */}
          <div className="border-border/60 flex items-center justify-between border-b p-3.5">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <IconMessages className="size-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {isCustomerMode ? 'แชทและข้อความ' : 'กล่องข้อความ'}
                </h3>
                <span className="text-muted-foreground text-xs">
                  {filteredConversations.length} การสนทนา
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {totalUnread > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[11px]">
                  {totalUnread} ยังไม่อ่าน
                </Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-7"
                    onClick={handleRefetch}
                  >
                    <IconRefresh className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>รีเฟรชข้อมูล</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Search bar */}
          <div className="border-border/40 border-b p-2.5">
            <div className="relative">
              <IconSearch className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input
                placeholder="ค้นหาชื่อ, อีเมล หรือข้อความ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pr-7 pl-8 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2"
                >
                  <IconX className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          {!isCustomerMode && (
            <div className="border-border/40 bg-muted/20 border-b px-2.5 py-1.5">
              <Tabs
                value={filterType}
                onValueChange={(val) => setFilterType(val as FilterType)}
              >
                <TabsList className="grid h-7 w-full grid-cols-4 p-0.5 text-xs">
                  <TabsTrigger value="all" className="text-[11px]">
                    ทั้งหมด
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-[11px]">
                    ยังไม่อ่าน
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-[11px]">
                    AI ตอบ
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-[11px]">
                    คนตอบ
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="space-y-2 p-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredConversations.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                <div className="bg-muted text-muted-foreground mb-3 flex size-12 items-center justify-center rounded-full">
                  <IconFilter className="size-6" />
                </div>
                <p className="text-sm font-medium">ไม่พบบทสนทนา</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {searchQuery
                    ? 'ลองค้นหาด้วยคำค้นหาอื่น'
                    : 'ยังไม่มีข้อความในหมวดหมู่นี้'}
                </p>
              </div>
            )}

            {!isLoading &&
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isSelected={selectedId === conv.id}
                  onClick={() => handleSelect(conv.id)}
                />
              ))}
          </div>
        </div>

        {/* ================= COLUMN 2: ACTIVE CHAT WINDOW ================= */}
        <div
          className={cn(
            'flex flex-1 flex-col overflow-hidden',
            !selectedId ? 'hidden md:flex' : 'flex',
          )}
        >
          {selectedId && selectedConv ? (
            <div className="flex h-full flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="border-border/60 bg-card/50 flex items-center justify-between border-b px-4 py-2.5">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 md:hidden"
                    onClick={() => setSelectedId(null)}
                  >
                    <IconArrowLeft className="size-4" />
                  </Button>

                  <Avatar className="size-9 border shadow-2xs">
                    {customerAvatar && (
                      <AvatarImage src={customerAvatar} alt={customerName} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {customerName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{customerName}</h4>
                      {selectedConv.storeName && (
                        <span className="bg-muted text-muted-foreground py-0.2 rounded px-1.5 text-[10px]">
                          {selectedConv.storeName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {selectedConv.isAiEnabled ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                          <IconSparkles className="size-3" />
                          AI กำลังช่วยตอบ
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">
                          โหมดตอบด้วยตนเอง
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                  {/* AI Quick Toggle */}
                  {!isCustomerMode && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="border-border/60 bg-background/80 hidden items-center gap-2 rounded-full border px-2.5 py-1 sm:flex">
                          <label
                            htmlFor="header-ai-toggle"
                            className="cursor-pointer text-xs font-medium"
                          >
                            <span className="flex items-center gap-1">
                              <IconSparkles
                                className={cn(
                                  'size-3.5',
                                  selectedConv.isAiEnabled
                                    ? 'text-purple-600'
                                    : 'text-muted-foreground',
                                )}
                              />
                              <span className="text-[11px]">AI</span>
                            </span>
                          </label>
                          <Switch
                            id="header-ai-toggle"
                            checked={selectedConv.isAiEnabled}
                            disabled={isTogglingAi}
                            onCheckedChange={handleToggleAi}
                            className="scale-80 data-[state=checked]:bg-purple-600"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {selectedConv.isAiEnabled
                          ? 'คลิกเพื่อปิด AI และตอบด้วยตนเอง'
                          : 'คลิกเพื่อเปิด AI ช่วยตอบคำถามอัตโนมัติ'}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Customer Info toggle */}
                  {!isCustomerMode && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={showCustomerPanel ? 'secondary' : 'ghost'}
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            setShowCustomerPanel(!showCustomerPanel)
                          }
                        >
                          <IconInfoCircle className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>ข้อมูลลูกค้า</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Chat Messages and Input */}
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  conversationId={selectedId}
                  currentUserId={currentUserId}
                  isAiEnabled={selectedConv.isAiEnabled}
                  canToggleAi={false}
                />
              </div>
            </div>
          ) : (
            /* Empty chat state */
            <div className="bg-muted/10 flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-2xl shadow-xs">
                <IconMessages className="size-8" />
              </div>
              <h3 className="text-base font-semibold">
                เลือกบทสนทนาเพื่อเริ่มพูดคุย
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
                คลิกเลือกการสนทนาจากรายการทางด้านซ้ายเพื่อดูข้อความ
                ประวัติการคุย และตอบกลับลูกค้าแบบ Real-time
              </p>
            </div>
          )}
        </div>

        {/* ================= COLUMN 3: CUSTOMER DETAILS PANEL ================= */}
        {showCustomerPanel && selectedConv && !isCustomerMode && (
          <div className="border-border/60 bg-card/30 flex w-72 flex-col border-l transition-all lg:w-80">
            {/* Header */}
            <div className="border-border/60 flex items-center justify-between border-b p-3.5">
              <h4 className="text-sm font-semibold">ข้อมูลลูกค้า</h4>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setShowCustomerPanel(false)}
              >
                <IconX className="size-3.5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              {/* Profile Card */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-16 border-2 shadow-xs">
                  {customerAvatar && (
                    <AvatarImage src={customerAvatar} alt={customerName} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                    {customerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-2.5 text-sm font-semibold">{customerName}</h3>
                <span className="text-muted-foreground text-xs">
                  {selectedConv.customerRole || 'ลูกค้า'}
                </span>
              </div>

              {/* Contact info */}
              <div className="border-border/60 space-y-2.5 rounded-xl border p-3 text-xs">
                <span className="text-muted-foreground block font-medium">
                  ข้อมูลติดต่อ
                </span>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <IconMail className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">
                      {selectedConv.customerEmail || 'ไม่มีอีเมล'}
                    </span>
                  </div>
                  {selectedConv.customerEmail && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={() =>
                        handleCopy(selectedConv.customerEmail!, 'email')
                      }
                    >
                      {copiedField === 'email' ? (
                        <IconCheck className="size-3 text-emerald-500" />
                      ) : (
                        <IconCopy className="size-3" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <IconPhone className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">
                      {selectedConv.customerPhone || 'ไม่มีเบอร์โทร'}
                    </span>
                  </div>
                  {selectedConv.customerPhone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={() =>
                        handleCopy(selectedConv.customerPhone!, 'phone')
                      }
                    >
                      {copiedField === 'phone' ? (
                        <IconCheck className="size-3 text-emerald-500" />
                      ) : (
                        <IconCopy className="size-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Conversation Meta */}
              <div className="border-border/60 space-y-2.5 rounded-xl border p-3 text-xs">
                <span className="text-muted-foreground block font-medium">
                  สถานะการสนทนา
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ระบบ AI ช่วยตอบ</span>
                  <Switch
                    checked={selectedConv.isAiEnabled}
                    disabled={isTogglingAi}
                    onCheckedChange={handleToggleAi}
                    className="scale-85 data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="text-muted-foreground flex items-center justify-between">
                  <span>รหัสบทสนทนา</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span>{selectedConv.id.slice(0, 8)}...</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5"
                      onClick={() => handleCopy(selectedConv.id, 'convId')}
                    >
                      {copiedField === 'convId' ? (
                        <IconCheck className="size-2.5 text-emerald-500" />
                      ) : (
                        <IconCopy className="size-2.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {selectedConv.storeName && (
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>ร้านค้า</span>
                    <span className="text-foreground font-medium">
                      {selectedConv.storeName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
}
