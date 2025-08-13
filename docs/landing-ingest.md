# Landing Pages Ingest API

- URL: `POST /api/landing-pages`
- Content-Type: `application/json`
- Base URL (env): `NEXT_PUBLIC_BASE_URL`

## Auth
- Required header when secrets are configured:
  - `x-webhook-secret: <secret>`
  - Optional `x-secret-id: primary|1|secondary|2` (dual-active rotation window)
- Optional anti‑replay signature (if you send it and secret is set):
  - `X-Signature-Timestamp: <unix-seconds>` (±300 s window)
  - `X-Signature: sha256=HEX(hmac(secret, timestamp+"\n"+rawBody))`

## Idempotence
- `Idempotency-Key: <UUIDv4>`
- TTL: 30 days
- Replay (same key + same payload): returns same 2xx with header `Idempotency-Replayed: true`
- Mismatch (same key + different payload): `409 Idempotency Mismatch`

## Payload (AI Farma JSON)
- Required: `title`, `contentHtml`, `keywords`, `language`
- Supported fields: `slug`, `summary`, `category`, `faq[]`, image fields (`imageUrl`, `imageAlt`, `imageSourceName`, `imageSourceUrl`, `imageLicense`, `imageWidth`, `imageHeight`, `imageType`), tables (`comparisonTables`, `pricingTables`, `featureTables`, `dataTables`)
- `keywords` accepted at root and/or `meta.keywords`
- `slug` should be at root; uniqueness: combination `slug + language`

## Responses
- 201 Created:
  - AI format: `{ status: "ok", url: "/landing/<slug>", slug: "<slug>" }`
  - Headers: `X-Request-Id`, optionally `Idempotency-Key`
- 409 Conflict: slug+language exists or idempotency mismatch
- 422 Unprocessable Entity: validation errors
- 401 Unauthorized: invalid secret/signature

## curl examples

Create (with HMAC + idempotence):
```bash
BASE="http://localhost:3000"
SECRET="$WEBHOOK_SECRET"
TS=$(date +%s)
BODY='{"title":"Test","contentHtml":"<p>..</p>","keywords":["ai"],"language":"en","slug":"test-slug"}'
SIG=$(node -e "const c=require('crypto');const s=process.env.SECRET;const b=process.argv[1];const t=process.argv[2];console.log('sha256='+c.createHmac('sha256',s).update(t+'\\n'+b).digest('hex'))" "$BODY" "$TS")

curl -X POST "$BASE/api/landing-pages" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -H "x-secret-id: primary" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "X-Signature-Timestamp: $TS" \
  -H "X-Signature: $SIG" \
  -d "$BODY"
```

Replay (same key + same body): should return 201/200 with `Idempotency-Replayed: true`.

## Rotation checklist (dual-active)
1) Add new value to `WEBHOOK_SECRET_SECONDARY` on receiver
2) Sender starts using `x-secret-id: secondary` with new secret
3) After propagation, swap: move secondary -> primary on receiver; clear secondary
4) Sender switches `x-secret-id` to `primary` with new secret

## Notes
- No fallbacks for base URL; must set `NEXT_PUBLIC_BASE_URL` appropriately per environment.
- Slug+language conflict is a hard fail (no auto-changes).


