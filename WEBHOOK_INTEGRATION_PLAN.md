# 🚀 Webhook Integration Plan pro AI Farma

## 🎯 Doporučená architektura: WEBHOOK + QUEUE

### Fáze 1: Základní webhook (READY NOW!)
```
AI Farma → POST /api/landing-pages → Immediate processing → Published
```

### Fáze 2: Robustní webhook s queue (pro scale)
```
AI Farma → POST /api/webhook/landing-pages → Queue → Background processing → Published
```

## 📡 Současný stav - READY!

**Endpoint:** `POST http://23.88.98.49/api/landing-pages`
**Security:** Optional webhook secret
**Response time:** ~200-500ms
**Capacity:** Zvládne střední objem (10-50 req/min)

## 🔧 Implementace

### Varianta A: Přímý webhook (Doporučeno pro start)
```javascript
// AI Farma kod
async function publishToComparee(generatedContent) {
  const response = await fetch('http://23.88.98.49/api/landing-pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.WEBHOOK_SECRET
    },
    body: JSON.stringify({
      title: generatedContent.title,
      contentHtml: generatedContent.html,
      keywords: generatedContent.keywords,
      language: generatedContent.language || 'cs',
      category: generatedContent.category
    })
  })
  
  if (response.ok) {
    const result = await response.json()
    console.log(`✅ Published: ${result.url}`)
    return result
  } else {
    console.error('❌ Webhook failed:', await response.text())
    throw new Error('Webhook failed')
  }
}
```

### Varianta B: Queue webhook (pro vysoký objem)
```javascript
// Budoucí rozšíření s queue
POST /api/webhook/landing-pages-queue
→ Redis/Database queue
→ Background worker processes
→ Parallel publishing
→ Retry logic
→ Status tracking
```

## 🚦 Retry strategie

```javascript
// Retry logic v AI farmě
async function publishWithRetry(content, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await publishToComparee(content)
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        // Log failed content for manual retry
        await logFailedPublication(content, error)
        throw error
      }
      
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000)
    }
  }
}
```

## 📊 Monitoring & Logging

### Na straně AI farmy:
- Success rate webhooků
- Response times
- Failed publications log

### Na straně Comparee.ai:
- Webhook volume
- Processing times
- Error rates
- Published pages count

## 🔒 Security best practices

1. **Webhook secret** - ověření autenticity
2. **Rate limiting** - ochrana proti spam
3. **Payload validation** - robustní validace
4. **Error logging** - pro debugging

## ⚡ Performance optimizations

1. **Async processing** - webhook vrátí 202 Accepted okamžitě
2. **Batch operations** - skupiny po 10-50 pages
3. **CDN integration** - rychlé načítání stránek
4. **Database indexing** - optimální queries

## 🎛️ Configuration

### Environment variables (.env):
```bash
# Webhook security
WEBHOOK_SECRET=your-super-secure-key

# Performance tuning
MAX_WEBHOOK_PAYLOAD_SIZE=1MB
WEBHOOK_TIMEOUT=30s
WEBHOOK_RATE_LIMIT=100/minute

# Queue (budoucí)
REDIS_URL=redis://localhost:6379
QUEUE_WORKERS=3
```

## 📈 Scaling path

**Start:** Direct webhook (current setup)
**Medium:** Queue + workers
**Large:** Microservices + message broker
**Enterprise:** Event sourcing + CQRS

## ✅ Next steps

1. **Test webhook** s AI farmou (1-2 dny)
2. **Monitor performance** první týden
3. **Add queue** pokud objem > 50/min
4. **Optimize** podle real-world dat
