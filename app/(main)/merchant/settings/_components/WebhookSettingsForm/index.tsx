'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useDeleteWebhookEndpoint,
  useRegenerateWebhookSecret,
  useStoreWebhookEndpoints,
  useTestWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useWebhookLogs,
} from '@/actions/hooks/webhook'
import { StoreWebhookEndpointItem } from '@/actions/webhook'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconAlertCircle,
  IconCheck,
  IconCode,
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconRefresh,
  IconSend,
  IconTrash,
  IconWebhook,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { WebhookEndpointDialog } from './_components/WebhookEndpointDialog'
import {
  WebhookLogDetailDialog,
  WebhookLogItem,
} from './_components/WebhookLogDetailDialog'

export function WebhookSettingsForm() {
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

  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(
    null,
  )

  if (!selectedStoreId || selectedStoreId === ALL_STORES) {
    return (
      <ActionRequiredAlert
        title="กรุณาเลือกร้านค้า"
        description="กรุณาเลือกร้านค้าที่ต้องการตั้งค่า Webhook จากเมนูด้านบน"
      />
    )
  }

  const handleCopySecret = (id: string, secret: string) => {
    copy(secret)
    setCopiedId(id)
    toast.success('คัดลอก Signing Secret เรียบร้อยแล้ว')
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
    updateEndpoint(
      {
        endpointId: endpoint.id,
        storeId: selectedStoreId,
        data: {
          url: endpoint.url,
          description: endpoint.description,
          events: endpoint.events,
          isActive: checked,
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(
              checked
                ? 'เปิดใช้งาน Webhook เรียบร้อยแล้ว'
                : 'ปิดใช้งาน Webhook ชั่วคราวแล้ว',
            )
          } else {
            toast.error(res.message || 'เกิดข้อผิดพลาด')
          }
        },
      },
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบ Webhook Endpoint นี้ใช่หรือไม่?')) {
      deleteEndpoint(id, {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('ลบ Webhook Endpoint สำเร็จ')
            if (selectedEndpointId === id) {
              setSelectedEndpointId(undefined)
            }
          } else {
            toast.error(res.message || 'เกิดข้อผิดพลาด')
          }
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const handleRegenerate = (id: string) => {
    if (
      confirm(
        'การสร้าง Signing Secret ใหม่จะทำให้ระบบเดิมที่ใช้ Secret เก่า Verify ไม่ผ่านทันที คุณต้องการทำต่อหรือไม่?',
      )
    ) {
      regenerateSecret(id, {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('สร้าง Secret ใหม่สำเร็จ')
          } else {
            toast.error(res.message || 'เกิดข้อผิดพลาด')
          }
        },
      })
    }
  }

  const handleTestPing = (id: string) => {
    setTestingEndpointId(id)
    testPing(id, {
      onSuccess: (res) => {
        setTestingEndpointId(null)
        if (res.success) {
          toast.success(res.message)
        } else {
          toast.error(res.message)
        }
      },
      onError: (err) => {
        setTestingEndpointId(null)
        toast.error(err.message)
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

  const handleViewLog = (log: any) => {
    setSelectedLog(log)
    setLogDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageTabHeader
            variant="secondary"
            icon={IconWebhook}
            title="Webhooks (Outbound API)"
            description="ส่งข้อมูล Event คำสั่งซื้อแบบ Real-time ไปยังเซิร์ฟเวอร์ของคุณ
              เหมาะสำหรับเชื่อมต่อระบบเติมเกม เติมเงินอัตโนมัติ หรือ ERP ภายนอก"
            endContent={
              <Button onClick={handleOpenAdd} className="shrink-0">
                <IconPlus size={16} />
                <span>เพิ่ม Webhook Endpoint</span>
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : endpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <div className="bg-muted rounded-full p-3">
                <IconWebhook className="text-muted-foreground size-8" />
              </div>
              <h3 className="mt-3 text-base font-semibold">
                ยังไม่มี Webhook Endpoint
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                เพิ่ม Endpoint URL
                ของคุณเพื่อเริ่มรับการแจ้งเตือนเมื่อลูกค้าทำรายการสั่งซื้อหรือชำระเงินสำเร็จ
              </p>
              <Button onClick={handleOpenAdd} className="mt-4 gap-1.5">
                <IconPlus size={16} />
                <span>เพิ่ม Endpoint แรกของคุณ</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint URL / รายละเอียด</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Signing Secret</TableHead>
                      <TableHead className="text-center">สถานะ</TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpoints.map((endpoint) => {
                      const isRevealed = !!revealedSecrets[endpoint.id]
                      const isThisTesting = testingEndpointId === endpoint.id

                      return (
                        <TableRow
                          key={endpoint.id}
                          className={
                            activeEndpointId === endpoint.id
                              ? 'bg-muted/30'
                              : undefined
                          }
                          onClick={() => setSelectedEndpointId(endpoint.id)}
                        >
                          <TableCell className="max-w-xs">
                            <div className="font-mono text-sm font-semibold">
                              {endpoint.url}
                            </div>
                            {endpoint.description && (
                              <div className="text-muted-foreground text-xs">
                                {endpoint.description}
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {endpoint.events.map((ev) => (
                                <Badge
                                  key={ev}
                                  variant={
                                    ev === 'order.paid'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {ev}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span>
                                {isRevealed
                                  ? endpoint.secret
                                  : `${endpoint.secret.slice(0, 10)}••••••••••••`}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleRevealSecret(endpoint.id)
                                }}
                                title={isRevealed ? 'ซ่อน Secret' : 'ดู Secret'}
                              >
                                {isRevealed ? (
                                  <IconEyeOff size={13} />
                                ) : (
                                  <IconEye size={13} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopySecret(endpoint.id, endpoint.secret)
                                }}
                                title="คัดลอก Secret"
                              >
                                {copiedId === endpoint.id ? (
                                  <IconCheck
                                    size={13}
                                    className="text-emerald-500"
                                  />
                                ) : (
                                  <IconCopy size={13} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground size-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRegenerate(endpoint.id)
                                }}
                                disabled={isRegenerating}
                                title="สร้าง Secret ใหม่"
                              >
                                <IconRefresh size={13} />
                              </Button>
                            </div>
                          </TableCell>

                          <TableCell className="text-center">
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="inline-block"
                            >
                              <Switch
                                checked={endpoint.isActive}
                                onCheckedChange={(checked) =>
                                  handleToggleActive(endpoint, checked)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 px-2.5 text-xs"
                                onClick={() => handleTestPing(endpoint.id)}
                                disabled={isTesting && isThisTesting}
                              >
                                {isThisTesting ? (
                                  <Spinner className="h-3.5 w-3.5" />
                                ) : (
                                  <IconSend size={13} />
                                )}
                                <span>ทดสอบส่ง</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleOpenEdit(endpoint)}
                                title="แก้ไข"
                              >
                                <IconEdit size={15} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 size-8"
                                onClick={() => handleDelete(endpoint.id)}
                                disabled={isDeleting}
                                title="ลบ"
                              >
                                <IconTrash size={15} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IconCode className="text-primary h-5 w-5" />
            <CardTitle className="text-base">
              คู่มือความปลอดภัยสำหรับนักพัฒนา (Signature Verification)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Sitepow จะส่ง Header{' '}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono">
              X-Sitepow-Signature: t=1725414162,v1=hash_value
            </code>{' '}
            มาพร้อมทุก Request ฝั่งเซิร์ฟเวอร์ของคุณควรตรวจสอบ Signature
            เพื่อป้องกันการปลอม Request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nodejs" className="flex flex-col gap-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="bg-background/80 flex h-auto w-fit shrink-0 flex-row! items-center justify-start gap-1 rounded-xl border p-1 shadow-sm">
                <TabsTrigger
                  value="nodejs"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                >
                  Node.js
                </TabsTrigger>
                <TabsTrigger
                  value="php"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                >
                  PHP
                </TabsTrigger>
                <TabsTrigger
                  value="java"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                >
                  Java
                </TabsTrigger>
                <TabsTrigger
                  value="python"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                >
                  Python
                </TabsTrigger>
                <TabsTrigger
                  value="go"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                >
                  Go
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Node.js */}
            <TabsContent value="nodejs" className="mt-0">
              <pre className="bg-background overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
                {`// Node.js / Express / Next.js
import crypto from 'crypto'

export async function POST(req) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('x-sitepow-signature') || ''
  const secret = process.env.SITEPOW_WEBHOOK_SECRET // whsec_...

  const parts = Object.fromEntries(sigHeader.split(',').map(s => s.split('=')))
  if (!parts.t || !parts.v1) {
    return new Response('Missing signature parameters', { status: 400 })
  }

  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(\`\${parts.t}.\${rawBody}\`)
    .digest('hex')

  if (parts.v1 !== expectedHash) {
    return new Response('Invalid Signature', { status: 400 })
  }

  const { event, data } = JSON.parse(rawBody)
  if (event === 'order.paid') {
    // เติมเงินอัตโนมัติ / ตัดสต็อก
    console.log('ชำระเงินสำเร็จ:', data.orderNumber, data.totalAmount)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}`}
              </pre>
            </TabsContent>

            {/* PHP */}
            <TabsContent value="php" className="mt-0">
              <pre className="bg-background overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
                {`<?php
// PHP Native / Laravel
$secret = getenv('SITEPOW_WEBHOOK_SECRET'); // whsec_...
$rawBody = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_X_SITEPOW_SIGNATURE'] ?? '';

$parts = [];
foreach (explode(',', $sigHeader) as $item) {
    $pair = explode('=', trim($item), 2);
    if (count($pair) === 2) {
        $parts[$pair[0]] = $pair[1];
    }
}

if (!isset($parts['t']) || !isset($parts['v1'])) {
    http_response_code(400);
    exit('Missing signature parameters');
}

$payloadToSign = $parts['t'] . '.' . $rawBody;
$expectedHash = hash_hmac('sha256', $payloadToSign, $secret);

// hash_equals เพื่อป้องกัน Timing attacks
if (!hash_equals($expectedHash, $parts['v1'])) {
    http_response_code(400);
    exit('Invalid Signature');
}

$eventData = json_decode($rawBody, true);
if ($eventData['event'] === 'order.paid') {
    // ดำเนินการเติมเงิน / บันทึก Order
}

http_response_code(200);
echo json_encode(['received' => true]);`}
              </pre>
            </TabsContent>

            {/* Java */}
            <TabsContent value="java" className="mt-0">
              <pre className="bg-background overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
                {`// Java (Spring Boot)
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
public class WebhookController {

    private static final String SECRET = System.getenv("SITEPOW_WEBHOOK_SECRET");

    @PostMapping("/api/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Sitepow-Signature", defaultValue = "") String sigHeader) {

        Map<String, String> parts = new HashMap<>();
        for (String param : sigHeader.split(",")) {
            String[] kv = param.trim().split("=", 2);
            if (kv.length == 2) parts.put(kv[0], kv[1]);
        }

        if (!parts.containsKey("t") || !parts.containsKey("v1")) {
            return ResponseEntity.badRequest().body("Missing signature parameters");
        }

        try {
            String payloadToSign = parts.get("t") + "." + rawBody;
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);

            byte[] hashBytes = sha256Hmac.doFinal(payloadToSign.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            String expectedHash = sb.toString();

            if (!MessageDigest.isEqual(expectedHash.getBytes(), parts.get("v1").getBytes())) {
                return ResponseEntity.status(400).body("Invalid Signature");
            }

            // TODO: ประมวลผล Event JSON ต่อไป
            return ResponseEntity.ok("{\\"received\\": true}");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Verification Error");
        }
    }
}`}
              </pre>
            </TabsContent>

            {/* Python */}
            <TabsContent value="python" className="mt-0">
              <pre className="bg-background overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
                {`# Python (FastAPI / Flask)
import hmac
import hashlib
import json
import os
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
SECRET = os.getenv("SITEPOW_WEBHOOK_SECRET", "")

@app.post("/webhook")
async def handle_webhook(request: Request):
    raw_body = (await request.body()).decode("utf-8")
    sig_header = request.headers.get("X-Sitepow-Signature", "")

    parts = dict(x.split("=", 1) for x in sig_header.split(",") if "=" in x)
    timestamp = parts.get("t")
    signature = parts.get("v1")

    if not timestamp or not signature:
        raise HTTPException(status_code=400, detail="Missing signature headers")

    payload_to_sign = f"{timestamp}.{raw_body}".encode("utf-8")
    expected_hash = hmac.new(
        SECRET.encode("utf-8"),
        payload_to_sign,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, signature):
        raise HTTPException(status_code=400, detail="Invalid Signature")

    payload = json.loads(raw_body)
    if payload.get("event") == "order.paid":
        # ดำเนินการ Fulfillment
        pass

    return {"received": True}`}
              </pre>
            </TabsContent>

            {/* Go */}
            <TabsContent value="go" className="mt-0">
              <pre className="bg-background overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed">
                {`// Go (net/http)
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "io"
    "net/http"
    "os"
    "strings"
)

func webhookHandler(w http.ResponseWriter, r *http.Request) {
    secret := os.Getenv("SITEPOW_WEBHOOK_SECRET")
    bodyBytes, _ := io.ReadAll(r.Body)
    rawBody := string(bodyBytes)

    sigHeader := r.Header.Get("X-Sitepow-Signature")
    parts := make(map[string]string)
    for _, item := range strings.Split(sigHeader, ",") {
        kv := strings.SplitN(strings.TrimSpace(item), "=", 2)
        if len(kv) == 2 {
            parts[kv[0]] = kv[1]
        }
    }

    t, hasT := parts["t"]
    v1, hasV1 := parts["v1"]
    if !hasT || !hasV1 {
        http.Error(w, "Missing signature headers", http.StatusBadRequest)
        return
    }

    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write([]byte(t + "." + rawBody))
    expectedHash := hex.EncodeToString(mac.Sum(nil))

    if !hmac.Equal([]byte(expectedHash), []byte(v1)) {
        http.Error(w, "Invalid Signature", http.StatusBadRequest)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("{\\"received\\": true}"))
}`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {endpoints.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">
                ประวัติการส่ง Webhook ล่าสุด (Delivery Logs)
              </CardTitle>
              <CardDescription className="text-xs">
                {activeEndpointId ? (
                  <>
                    แสดงประวัติของ{' '}
                    <span className="text-foreground font-mono font-medium">
                      {endpoints.find((e) => e.id === activeEndpointId)?.url}
                    </span>
                  </>
                ) : (
                  'เลือก Endpoint ด้านบนเพื่อดูประวัติ'
                )}
              </CardDescription>
            </div>
            {activeEndpointId && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => handleTestPing(activeEndpointId)}
                disabled={isTesting}
              >
                <IconSend size={13} />
                <span>ส่งทดสอบ (Ping)</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingLogs ? (
              <div className="flex h-24 items-center justify-center">
                <Spinner className="h-5 w-5" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-muted-foreground flex h-24 flex-col items-center justify-center rounded-lg border border-dashed text-center text-sm">
                <IconAlertCircle className="mb-1 h-5 w-5" />
                ยังไม่มีประวัติการส่ง Webhook สำหรับ Endpoint นี้ (ลองกดปุ่ม
                &quot;ทดสอบส่ง&quot; ด้านบน)
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>เวลาที่ใช้</TableHead>
                      <TableHead>วัน-เวลาที่ส่ง</TableHead>
                      <TableHead className="text-right">ดูข้อมูล</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant={log.isSuccess ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {log.isSuccess ? 'Success' : 'Failed'}
                            {log.statusCode ? ` (${log.statusCode})` : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold">
                            {log.event}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {log.executionTimeMs}ms
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(log.createdAt).toLocaleString('th-TH')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleViewLog(log)}
                          >
                            ดู Payload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <WebhookEndpointDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        endpoint={editingEndpoint}
      />
      <WebhookLogDetailDialog
        open={logDialogOpen}
        setOpen={setLogDialogOpen}
        log={selectedLog}
      />
    </div>
  )
}
