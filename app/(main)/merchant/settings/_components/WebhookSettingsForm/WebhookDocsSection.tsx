'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  IconCheck,
  IconCode,
  IconCopy,
  IconExternalLink,
  IconShieldLock,
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

export function WebhookDocsSection() {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedTab(id)
    toast.success('คัดลอกโค้ดตัวอย่างแล้ว')
    setTimeout(() => setCopiedTab(null), 2000)
  }

  const samplePayload = `{
  "event": "order.paid",
  "eventId": "f7d3a241-7153-432a-bc91-9e1208dcf201",
  "timestamp": "2026-10-05T11:45:00.000Z",
  "storeId": "store_123456",
  "data": {
    "orderId": "ord_987654321",
    "orderNumber": "ORD-20261005-001",
    "status": "PAID",
    "paymentMethod": "STRIPE_CREDIT_CARD",
    "totalAmount": 150.00,
    "paidAt": "2026-10-05T11:45:00.000Z",
    "customer": {
      "id": "cust_123",
      "name": "สมชาย ใจดี",
      "email": "customer@example.com",
      "phone": "0812345678"
    },
    "items": [
      {
        "id": "item_1",
        "productId": "prod_valorant",
        "variantId": "var_1000vp",
        "title": "เติม Valorant 1,000 VP",
        "variantTitle": "1,000 VP",
        "productType": "DIGITAL_SERVICE",
        "quantity": 1,
        "price": 150.00,
        "customerNote": "Riot ID: PlayerOne#TH1" // ข้อมูลสำคัญที่ลูกค้ากรอกตอนสั่งซื้อ (เช่น UID, Server, ชื่อตัวละคร)
      }
    ]
  }
}`

  const nodeCode = `// ตัวอย่างการตรวจสอบ Signature ใน Node.js (Express)
const express = require('express');
const crypto = require('crypto');

const app = express();
// หมายเหตุ: ต้องใช้ raw body สำหรับการ verify signature
app.use(express.json());

const WEBHOOK_SECRET = 'whsec_your_secret_here';

app.post('/api/webhook/orders', (req, res) => {
  const sigHeader = req.headers['x-webhook-signature'];
  // รูปแบบ: t=timestamp,v1=signature
  const match = sigHeader && sigHeader.match(/t=(\\d+),v1=([a-f0-9]+)/);
  if (!match) {
    return res.status(401).send('Missing or invalid signature header');
  }

  const [, timestamp, signature] = match;
  const rawBody = JSON.stringify(req.body);
  const signedPayload = \`\${timestamp}.\${rawBody}\`;

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'order.paid') {
    // นำข้อมูลไปเติมเกมอัตโนมัติ
    for (const item of data.items) {
      const playerUid = item.customerNote; // เช่น 'UID: 123456'
      console.log(\`ดำเนินการเติมเกม \${item.title} ให้กับ \${playerUid}\`);
      // เรียก API Game Server หรือบอทเติมเกมของคุณที่นี่
    }
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));`

  const pythonCode = `# ตัวอย่างการตรวจสอบ Signature ใน Python (FastAPI)
from fastapi import FastAPI, Request, HTTPException
import hmac
import hashlib
import json

app = FastAPI()
WEBHOOK_SECRET = "whsec_your_secret_here"

@app.post("/api/webhook/orders")
async def handle_order_webhook(request: Request):
    sig_header = request.headers.get("x-webhook-signature", "")
    # แยก t=timestamp,v1=signature
    parts = dict(item.split("=") for item in sig_header.split(",") if "=" in item)
    timestamp = parts.get("t")
    signature = parts.get("v1")

    if not timestamp or not signature:
        raise HTTPException(status_code=401, detail="Invalid signature header")

    body_bytes = await request.body()
    signed_payload = f"{timestamp}.".encode("utf-8") + body_bytes

    expected_sig = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        signed_payload,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_sig):
        raise HTTPException(status_code=401, detail="Signature mismatch")

    payload = json.loads(body_bytes.decode("utf-8"))
    event = payload.get("event")
    data = payload.get("data", {})

    if event == "order.paid":
        for item in data.get("items", []):
            game_account = item.get("customerNote")  # ข้อมูล UID เติมเกม
            print(f"เติมเกม {item.get('title')} ให้บัญชี {game_account}")

    return {"received": True}`

  const phpCode = `<?php
// ตัวอย่างการตรวจสอบ Signature ใน PHP
$webhookSecret = 'whsec_your_secret_here';

$sigHeader = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
preg_match('/t=(\\d+),v1=([a-f0-9]+)/', $sigHeader, $matches);

if (!$matches) {
    http_response_code(401);
    exit('Missing or invalid signature');
}

$timestamp = $matches[1];
$signature = $matches[2];
$rawBody = file_get_contents('php://input');

$signedPayload = "{$timestamp}.{$rawBody}";
$expectedSignature = hash_hmac('sha256', $signedPayload, $webhookSecret);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}

$payload = json.decode($rawBody, true);
$event = $payload['event'] ?? '';
$data = $payload['data'] ?? [];

if ($event === 'order.paid') {
    foreach ($data['items'] as $item) {
        $customerNote = $item['customerNote']; // เช่น UID เติมเกม
        // สั่งบอทหรือ API เติมเกม
    }
}

http_response_code(200);
echo json_encode(['received' => true]);`

  return (
    <Card className="border-muted/80 border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconCode className="text-primary h-5 w-5" />
          <CardTitle className="text-base font-semibold">
            คู่มือการเชื่อมต่อ Webhook สำหรับนักพัฒนา (Developer Guide)
          </CardTitle>
        </div>
        <CardDescription>
          ระบบจะส่ง HTTP POST พร้อม Header ลายเซ็น HMAC-SHA256 ไปยัง URL
          ที่คุณกำหนดเมื่อเกิดเหตุการณ์ เช่น เมื่อลูกค้าชำระเงินสำเร็จ
          นำไปสั่งงานบอทเติมเกมอัตโนมัติได้ทันที
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Headers information */}
        <div className="space-y-2">
          <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
            <IconShieldLock className="h-4 w-4 text-emerald-600" />
            Headers ที่ระบบส่งให้
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <div className="bg-muted/40 rounded-lg border p-2.5">
              <span className="text-primary font-mono font-bold">
                X-Webhook-Signature
              </span>
              <p className="text-muted-foreground mt-1">
                ลายเซ็น HMAC-SHA256 ในรูปแบบ{' '}
                <code className="bg-muted rounded px-1">
                  t=timestamp,v1=signature
                </code>
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg border p-2.5">
              <span className="text-primary font-mono font-bold">
                X-Webhook-Event
              </span>
              <p className="text-muted-foreground mt-1">
                ชื่อเหตุการณ์ เช่น{' '}
                <Badge variant="outline" className="font-mono text-[10px]">
                  order.paid
                </Badge>
                ,{' '}
                <Badge variant="outline" className="font-mono text-[10px]">
                  order.created
                </Badge>
              </p>
            </div>
          </div>
        </div>

        {/* Code tabs */}
        <Tabs defaultValue="payload" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="h-8">
              <TabsTrigger value="payload" className="text-xs">
                ตัวอย่าง JSON Payload
              </TabsTrigger>
              <TabsTrigger value="nodejs" className="text-xs">
                Node.js (Express)
              </TabsTrigger>
              <TabsTrigger value="python" className="text-xs">
                Python (FastAPI)
              </TabsTrigger>
              <TabsTrigger value="php" className="text-xs">
                PHP
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payload" className="relative mt-2">
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 h-7 gap-1 text-xs"
              onClick={() => copyCode(samplePayload, 'payload')}
            >
              {copiedTab === 'payload' ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> คัดลอก JSON
                </>
              )}
            </Button>
            <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-neutral-200 dark:bg-neutral-950">
              {samplePayload}
            </pre>
          </TabsContent>

          <TabsContent value="nodejs" className="relative mt-2">
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 h-7 gap-1 text-xs"
              onClick={() => copyCode(nodeCode, 'nodejs')}
            >
              {copiedTab === 'nodejs' ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> คัดลอกโค้ด
                </>
              )}
            </Button>
            <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-neutral-200 dark:bg-neutral-950">
              {nodeCode}
            </pre>
          </TabsContent>

          <TabsContent value="python" className="relative mt-2">
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 h-7 gap-1 text-xs"
              onClick={() => copyCode(pythonCode, 'python')}
            >
              {copiedTab === 'python' ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> คัดลอกโค้ด
                </>
              )}
            </Button>
            <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-neutral-200 dark:bg-neutral-950">
              {pythonCode}
            </pre>
          </TabsContent>

          <TabsContent value="php" className="relative mt-2">
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 h-7 gap-1 text-xs"
              onClick={() => copyCode(phpCode, 'php')}
            >
              {copiedTab === 'php' ? (
                <>
                  <IconCheck className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <IconCopy className="h-3.5 w-3.5" /> คัดลอกโค้ด
                </>
              )}
            </Button>
            <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-neutral-200 dark:bg-neutral-950">
              {phpCode}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
