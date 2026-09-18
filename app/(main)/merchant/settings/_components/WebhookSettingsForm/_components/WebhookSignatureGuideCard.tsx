'use client'

import { useTranslations } from 'next-intl'
import { IconCode } from '@tabler/icons-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function WebhookSignatureGuideCard() {
  const t = useTranslations('merchant.settings.webhook')

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconCode className="text-primary h-5 w-5" />
          <CardTitle className="text-base">{t('guideTitle')}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {t.rich('guideDesc', {
            header: () => (
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
                X-Sitepow-Signature: t=1725414162,v1=hash_value
              </code>
            ),
          })}
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
            <pre className="bg-background overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
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
    // Automated top-up / Deduct stock
    console.log('Payment successful:', data.orderNumber, data.totalAmount)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}`}
            </pre>
          </TabsContent>

          {/* PHP */}
          <TabsContent value="php" className="mt-0">
            <pre className="bg-background overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
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

// hash_equals to prevent timing attacks
if (!hash_equals($expectedHash, $parts['v1'])) {
    http_response_code(400);
    exit('Invalid Signature');
}

$eventData = json_decode($rawBody, true);
if ($eventData['event'] === 'order.paid') {
    // Process top-up / Record order
}

http_response_code(200);
echo json_encode(['received' => true]);`}
            </pre>
          </TabsContent>

          {/* Java */}
          <TabsContent value="java" className="mt-0">
            <pre className="bg-background overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
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

            // TODO: Process Event JSON
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
            <pre className="bg-background overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
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

    if not hmac.compare_digest(expectedHash, signature):
        raise HTTPException(status_code=400, detail="Invalid Signature")

    payload = json.loads(raw_body)
    if payload.get("event") == "order.paid":
        # Process Fulfillment
        pass

    return {"received": True}`}
            </pre>
          </TabsContent>

          {/* Go */}
          <TabsContent value="go" className="mt-0">
            <pre className="bg-background overflow-x-auto rounded-lg border p-3 text-xs leading-relaxed">
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
  )
}
