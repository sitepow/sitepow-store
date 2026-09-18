export const SNIPPET_NODEJS = `// Node.js (Next.js App Router / Express)
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

export const SNIPPET_PYTHON = `# Python (FastAPI / Flask)
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

export const SNIPPET_PHP = `<?php
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

export const SNIPPET_GO = `package main

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

export const SAMPLE_PAYLOAD = `{
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
