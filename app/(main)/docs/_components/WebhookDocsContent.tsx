'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconCopy,
  IconKey,
  IconShieldCheck,
  IconTerminal2,
  IconWebhook,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CodeBlockProps {
  code: string
  language?: string
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground bg-background/60 hover:bg-background/90 absolute top-2 right-2 z-10 h-7 w-7"
        title="Copy code"
      >
        {copied ? (
          <IconCheck size={14} className="text-green-500" />
        ) : (
          <IconCopy size={14} />
        )}
      </Button>
      <pre className="border-border/50 dark:border-border overflow-x-auto rounded-xl border bg-slate-950 p-4 text-xs leading-relaxed text-slate-50">
        <code>{code}</code>
      </pre>
    </div>
  )
}

const SNIPPET_NODEJS = `// Node.js (Next.js App Router / Express)
import crypto from 'crypto'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('x-sitepow-signature') || ''
  const secret = process.env.SITEPOW_WEBHOOK_SECRET // whsec_...

  // 1. แยก timestamp และ signature v1
  const parts = Object.fromEntries(
    sigHeader.split(',').map((part) => part.trim().split('='))
  )
  const timestamp = parts['t']
  const receivedSig = parts['v1']

  if (!timestamp || !receivedSig) {
    return new Response('Missing signature', { status: 400 })
  }

  // 2. ป้องกัน Replay attack (อนุญาตไม่เกิน 5 นาที)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
    return new Response('Timestamp expired', { status: 400 })
  }

  // 3. ตรวจสอบ HMAC-SHA256
  const payloadToSign = \`\${timestamp}.\${rawBody}\`
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadToSign)
    .digest('hex')

  const isValid = crypto.timingSafeEqual(
    Buffer.from(receivedSig, 'hex'),
    Buffer.from(expectedSig, 'hex')
  )

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }

  // 4. ประมวลผล Event
  const event = JSON.parse(rawBody)
  switch (event.event) {
    case 'order.paid':
      console.log('ออเดอร์ชำระเงินแล้ว:', event.data.id, event.data.totalAmount)
      // เติมเกม / ส่งของ / ปรับสถานะอัตโนมัติ
      break
    case 'order.created':
      console.log('สร้างออเดอร์ใหม่:', event.data.id)
      break
    case 'order.cancelled':
      console.log('ยกเลิกออเดอร์:', event.data.id)
      break
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}`

const SNIPPET_PYTHON = `# Python (FastAPI / Flask)
import hmac
import hashlib
import time
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
WEBHOOK_SECRET = "whsec_..."

@app.post("/webhook")
async def sitepow_webhook(request: Request):
    raw_body = await request.body()
    sig_header = request.headers.get("x-sitepow-signature", "")

    # แยก t และ v1
    parts = dict(p.split("=", 1) for p in sig_header.split(",") if "=" in p)
    timestamp = parts.get("t")
    received_sig = parts.get("v1")

    if not timestamp or not received_sig:
        raise HTTPException(status_code=400, detail="Missing signature")

    # ป้องกัน Replay Attack (5 นาที)
    if abs(time.time() - int(timestamp)) > 300:
        raise HTTPException(status_code=400, detail="Timestamp expired")

    # ตรวจสอบ HMAC-SHA256
    payload_to_sign = f"{timestamp}.{raw_body.decode('utf-8')}".encode('utf-8')
    expected_sig = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload_to_sign,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(received_sig, expected_sig):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event_data = await request.json()
    if event_data.get("event") == "order.paid":
        # ดำเนินการคำสั่งซื้อที่จ่ายเงินแล้ว
        pass

    return {"received": True}`

const SNIPPET_PHP = `<?php
// PHP (Native / Laravel)
$rawBody = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_X_SITEPOW_SIGNATURE'] ?? '';
$secret = getenv('SITEPOW_WEBHOOK_SECRET');

// แยก timestamp และ signature v1
$parts = [];
foreach (explode(',', $sigHeader) as $part) {
    [$k, $v] = explode('=', trim($part), 2);
    $parts[$k] = $v;
}

$timestamp = $parts['t'] ?? null;
$receivedSig = $parts['v1'] ?? null;

if (!$timestamp || !$receivedSig) {
    http_response_code(400);
    exit('Missing signature');
}

// ตรวจสอบ Replay Attack (300 วินาที)
if (abs(time() - (int)$timestamp) > 300) {
    http_response_code(400);
    exit('Timestamp expired');
}

$payloadToSign = $timestamp . '.' . $rawBody;
$expectedSig = hash_hmac('sha256', $payloadToSign, $secret);

if (!hash_equals($expectedSig, $receivedSig)) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = json_decode($rawBody, true);
if ($event['event'] === 'order.paid') {
    // ออเดอร์ชำระเงินสำเร็จ
}

http_response_code(200);
echo json_encode(['received' => true]);`

const SNIPPET_GO = `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	secret := "whsec_..."
	body, _ := io.ReadAll(r.Body)
	sigHeader := r.Header.Get("X-Sitepow-Signature")

	parts := make(map[string]string)
	for _, p := range strings.Split(sigHeader, ",") {
		kv := strings.SplitN(strings.TrimSpace(p), "=", 2)
		if len(kv) == 2 {
			parts[kv[0]] = kv[1]
		}
	}

	tsStr, sig := parts["t"], parts["v1"]
	ts, _ := strconv.ParseInt(tsStr, 10, 64)

	// ตรวจสอบ Replay Attack (5 นาที)
	if math.Abs(float64(time.Now().Unix()-ts)) > 300 {
		http.Error(w, "Timestamp expired", http.StatusBadRequest)
		return
	}

	// คำนวณ HMAC-SHA256
	payload := fmt.Sprintf("%d.%s", ts, string(body))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(sig), []byte(expectedSig)) {
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(\`{"received":true}\`))
}`

const SAMPLE_PAYLOAD = `{
  "id": "evt_01J6XYZ987654321",
  "event": "order.paid",
  "createdAt": "2026-09-11T09:15:00.000Z",
  "storeId": "store_abc12345",
  "data": {
    "id": "ord_99887766",
    "orderNumber": "SP-20260911-001",
    "status": "PAID",
    "paymentStatus": "PAID",
    "paymentMethod": "PROMPTPAY",
    "currency": "THB",
    "totalAmount": 1590.00,
    "discountAmount": 100.00,
    "netAmount": 1490.00,
    "customer": {
      "name": "สมชาย ใจดี",
      "email": "customer@example.com",
      "phone": "0812345678"
    },
    "items": [
      {
        "id": "item_01",
        "productId": "prod_111",
        "title": "เสื้อยืด Sitepow Oversized",
        "quantity": 2,
        "price": 795.00,
        "sku": "SP-TSHIRT-BLK-L"
      }
    ]
  }
}`

export function WebhookDocsContent() {
  const t = useTranslations('docs')

  return (
    <div className="text-foreground mx-auto w-full max-w-5xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Banner */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Badge
            variant="outline"
            className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
          >
            <IconWebhook className="text-primary h-3.5 w-3.5" />
            {t('badge.apiDocs')}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {t('badge.version')}
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400"
          >
            {t('badge.security')}
          </Badge>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-base sm:text-lg">
          {t('hero.description')}
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2 sm:justify-start">
          <Link href="/merchant/settings?tab=webhook">
            <Button className="gap-2 font-medium">
              <IconKey size={16} />
              {t('hero.manageEndpoints')}
              <IconArrowRight size={14} />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="font-medium">
              {t('hero.contactSupport')}
            </Button>
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                1
              </div>
              <CardTitle className="text-base">
                {t('steps.step1Title')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs leading-relaxed">
            {t('steps.step1Desc')}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                2
              </div>
              <CardTitle className="text-base">
                {t('steps.step2Title')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs leading-relaxed">
            {t.rich('steps.step2Desc', {
              header: () => (
                <code className="text-foreground bg-muted rounded px-1">
                  X-Sitepow-Signature
                </code>
              ),
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                3
              </div>
              <CardTitle className="text-base">
                {t('steps.step3Title')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs leading-relaxed">
            {t('steps.step3Desc')}
          </CardContent>
        </Card>
      </div>

      {/* Webhook Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('events.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-primary text-[11px]">
                  order.created
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base">
                {t('events.createdTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs leading-relaxed">
              {t('events.createdDesc')}
            </CardContent>
          </Card>

          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className="text-[11px]">order.paid</Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600"
                >
                  {t('events.recommendedBadge')}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base">
                {t('events.paidTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs leading-relaxed">
              {t('events.paidDesc')}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-destructive text-[11px]"
                >
                  order.cancelled
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base">
                {t('events.cancelledTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs leading-relaxed">
              {t('events.cancelledDesc')}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HTTP Headers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('headers.title')}
        </h2>
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">{t('headers.colName')}</th>
                    <th className="px-4 py-3">{t('headers.colExample')}</th>
                    <th className="px-4 py-3">{t('headers.colDesc')}</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y text-xs">
                  <tr>
                    <td className="text-foreground px-4 py-3 font-medium">
                      Content-Type
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      application/json
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {t('headers.contentTypeDesc')}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-foreground px-4 py-3 font-medium">
                      X-Sitepow-Signature
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      t=1725414162,v1=4f3a...
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {t('headers.signatureDesc')}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-foreground px-4 py-3 font-medium">
                      X-Sitepow-Event
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      order.paid
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {t('headers.eventDesc')}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-foreground px-4 py-3 font-medium">
                      X-Sitepow-Delivery
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      deliv_01J7K...
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {t('headers.deliveryDesc')}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-foreground px-4 py-3 font-medium">
                      User-Agent
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      Sitepow-Webhook/1.0
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {t('headers.userAgentDesc')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Verification Guide */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <IconShieldCheck className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-tight">
            {t('verification.title')}
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {t.rich('verification.description', {
            header: () => (
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
                X-Sitepow-Signature
              </code>
            ),
            format: () => (
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
                t=timestamp,v1=signature_hash
              </code>
            ),
          })}
        </p>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('verification.cardTitle')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t.rich('verification.cardDesc', {
                formula: () => (
                  <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
                    timestamp . rawBody
                  </code>
                ),
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="nodejs" className="w-full">
              <div className="overflow-x-auto pb-1">
                <TabsList className="bg-muted/60 flex h-auto w-fit shrink-0 gap-1 rounded-xl p-1">
                  <TabsTrigger
                    value="nodejs"
                    className="rounded-lg px-4 py-1.5 text-xs font-medium"
                  >
                    Node.js / Next.js
                  </TabsTrigger>
                  <TabsTrigger
                    value="python"
                    className="rounded-lg px-4 py-1.5 text-xs font-medium"
                  >
                    Python
                  </TabsTrigger>
                  <TabsTrigger
                    value="php"
                    className="rounded-lg px-4 py-1.5 text-xs font-medium"
                  >
                    PHP
                  </TabsTrigger>
                  <TabsTrigger
                    value="go"
                    className="rounded-lg px-4 py-1.5 text-xs font-medium"
                  >
                    Go
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="nodejs" className="mt-3">
                <CodeBlock code={SNIPPET_NODEJS} language="typescript" />
              </TabsContent>
              <TabsContent value="python" className="mt-3">
                <CodeBlock code={SNIPPET_PYTHON} language="python" />
              </TabsContent>
              <TabsContent value="php" className="mt-3">
                <CodeBlock code={SNIPPET_PHP} language="php" />
              </TabsContent>
              <TabsContent value="go" className="mt-3">
                <CodeBlock code={SNIPPET_GO} language="go" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Payload Sample */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('payload.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t.rich('payload.description', {
            event: () => (
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
                order.paid
              </code>
            ),
          })}
        </p>
        <CodeBlock code={SAMPLE_PAYLOAD} language="json" />
      </div>

      {/* Best Practices & Retry Policy */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('bestPractices.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IconClock className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">
                  {t('bestPractices.fast200Title')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
              <p>{t('bestPractices.fast200Desc')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IconShieldCheck className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base">
                  {t('bestPractices.idempotencyTitle')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
              <p>{t('bestPractices.idempotencyDesc')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IconTerminal2 className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">
                  {t('bestPractices.retryTitle')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
              <p>{t('bestPractices.retryDesc')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-base">
                  {t('bestPractices.autoDisableTitle')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
              <p>{t('bestPractices.autoDisableDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
