# 🌐 Translation System Documentation

## Overview

Automatizovaný překladový systém pro Comparee.ai, který odesílá překladové požadavky na externí Translation Service při vytvoření nového obsahu v angličtině.

## Architecture

```
Frontend → API (create/update) → DB Save → Background Translation Job → External Translation Service
```

## Supported Entities

### 1. 🏢 Company Registration
**Endpoint:** `POST /api/advertiser/register`
**Trigger:** Company registered with English content
**Fields translated:**
- `name` - Company name
- `description` - Company description
- `summary` - Company summary (if provided)
- `metaDescription` - SEO meta description (if provided)
- `keywords` - Company keywords/tags (if provided)

### 2. 📦 Product Creation
**Endpoints:** 
- `POST /api/products` (Admin/General)
- `POST /api/company-admin/products/add` (Company Admin)

**Trigger:** Product created with English content
**Fields translated:**
- `title` - Product name/title
- `description` - Product description
- `summary` - Product summary (if provided)
- `features` - Product features (extracted from detailInfo)
- `pros` - Product advantages
- `cons` - Product disadvantages
- `metaDescription` - SEO meta description (if provided)
- `keywords` - Product tags/keywords

## Configuration

### Environment Variables

```bash
# 🌐 TRANSLATION SERVICE
TRANSLATION_SERVICE_URL="http://localhost:4000"
TRANSLATION_SERVICE_API_KEY=""
```

**Production Setup:**
```bash
TRANSLATION_SERVICE_URL="https://translation-service.your-domain.com"
TRANSLATION_SERVICE_API_KEY="your-secure-api-key-here"
```

## Translation Job Format

### Request Payload
```json
{
  "entity_type": "product",
  "entity_id": "6a3c60d8-3cde-4c4b-ade9-4f685be08b72",
  "source_lang": "en",
  "target_langs": ["de", "fr", "es", "cs"],
  "fields": {
    "title": "AI Writing Assistant Pro",
    "description": "Advanced AI-powered writing tool for professionals",
    "features": ["Professional writing assistant with grammar checking"],
    "pros": [],
    "cons": [],
    "metaDescription": "Professional AI writing tool",
    "keywords": ["ai", "writing", "tool"]
  }
}
```

### HTTP Request Details
```http
POST {TRANSLATION_SERVICE_URL}/translate
Authorization: Bearer {TRANSLATION_SERVICE_API_KEY}
Content-Type: application/json
Timeout: 30 seconds
```

### Expected Response
```json
{
  "success": true,
  "job_id": "uuid-job-id",
  "message": "Translation job submitted successfully"
}
```

## Workflow

### 1. Entity Creation
1. User creates new entity (company/product) via API
2. Entity is saved to database with `lang = "en"` (implicit)
3. API returns success response to user immediately

### 2. Translation Processing (Async)
1. System extracts translatable fields from entity
2. Creates translation job payload
3. Sends HTTP POST to Translation Service
4. Logs success/failure (does not retry)

### 3. Error Handling
- ✅ **Non-blocking:** Translation failures do not affect entity creation
- ✅ **No retries:** Failed translations are logged but not retried
- ✅ **Comprehensive logging:** All requests and responses are logged
- ✅ **Timeout protection:** 30-second timeout prevents hanging requests

## Testing

### 1. Test Product Creation
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Writing Assistant Pro",
    "description": "Advanced AI-powered writing tool",
    "category": "AI Writing",
    "price": 29.99,
    "detailInfo": "Professional writing features",
    "hasTrial": true
  }'
```

### 2. Test Company Registration
```bash
curl -X POST http://localhost:3000/api/advertiser/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestTranslation AI Corp",
    "email": "test@example.com",
    "password": "test123",
    "contactPerson": "John Doe",
    "description": "AI company for translation solutions"
  }'
```

### 3. Test Translation Service Connection
```typescript
import { testTranslationService } from '@/lib/translation'

const result = await testTranslationService()
console.log(result) // { success: true, response_time: 120 }
```

## Monitoring & Logs

### Success Logs
```
🔄 Processing translation for product: 6a3c60d8-3cde-4c4b-ade9-4f685be08b72
📝 Extracted fields for translation: { entity_id: "...", field_count: 4 }
🌐 Sending translation job to: http://localhost:4000/translate
✅ Translation job submitted successfully in 245ms
🆔 Translation job ID: job-uuid-12345
```

### Error Logs
```
❌ Translation service error (503): Service temporarily unavailable
⚠️ Translation processing failed for product: 6a3c60d8... Connection timeout
💥 Unexpected error in translation job: Invalid API key
```

### Health Check Logs
```
✅ Translation service health check passed in 85ms
❌ Translation service health check failed: HTTP 404
```

## Implementation Details

### File Structure
```
lib/translation/
├── index.ts          # Main exports
├── types.ts          # TypeScript interfaces
├── helpers.ts        # Field extraction utilities
├── service.ts        # HTTP client for external service
└── processor.ts      # Main orchestration logic
```

### Key Functions

#### `processProductTranslation(product)`
- Main entry point for product translation
- Extracts fields, creates job, submits asynchronously

#### `processCompanyTranslation(company)`
- Main entry point for company translation
- Handles company-specific field mapping

#### `shouldTranslateEntity(entity, type)`
- Determines if entity has translatable content
- Checks for English language and minimum content

#### `extractProductFields(product)`
- Converts Prisma product model to translation fields
- Handles JSON parsing for arrays (tags, advantages, etc.)

#### `submitTranslationJob(job)`
- HTTP client for external translation service
- Includes timeout, error handling, detailed logging

## Production Deployment

### 1. Environment Setup
```bash
# Production .env
TRANSLATION_SERVICE_URL="https://translation-service.production.com"
TRANSLATION_SERVICE_API_KEY="prod-secure-api-key"
```

### 2. Translation Service Requirements
- **Endpoint:** `POST /translate`
- **Authentication:** Bearer token
- **Timeout:** Support 30+ second requests
- **Health Check:** `GET /health` endpoint

### 3. Monitoring Setup
- Monitor translation success/failure rates
- Set up alerts for service unavailability
- Track translation processing times
- Log aggregation for error analysis

## Troubleshooting

### Common Issues

#### Translation Service Unreachable
```
🔌 Translation service connection failed: getaddrinfo ENOTFOUND
```
**Solution:** Check `TRANSLATION_SERVICE_URL` and network connectivity

#### API Key Issues
```
❌ Translation service error (401): Unauthorized
```
**Solution:** Verify `TRANSLATION_SERVICE_API_KEY` is correct

#### Timeout Issues
```
⏰ Translation request timeout after 30000ms
```
**Solution:** Check translation service performance, consider increasing timeout

#### No Translatable Content
```
⏭️ Skipping translation - no translatable content or not English
```
**Solution:** Ensure entity has sufficient English content in required fields

## Future Enhancements

1. **Webhook Support:** Receive translation completion notifications
2. **Retry Mechanism:** Configurable retry logic for failed translations
3. **Batch Processing:** Group multiple entities into single requests
4. **Status Polling:** Check translation job status periodically
5. **Admin Dashboard:** Monitor translation queue and statistics
6. **Language Detection:** Auto-detect source language instead of assuming English

## Security Notes

- ✅ API keys stored securely in environment variables
- ✅ No sensitive data logged in translation requests
- ✅ HTTPS required for production translation service
- ✅ Request timeout prevents resource exhaustion
- ✅ No automatic retries to prevent API abuse

---

**Status:** ✅ **Production Ready**
**Last Updated:** January 2025
**Version:** 1.0.0