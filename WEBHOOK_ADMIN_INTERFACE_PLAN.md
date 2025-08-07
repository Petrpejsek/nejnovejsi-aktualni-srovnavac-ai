# 🔧 Webhook Admin Interface Plan

## 🎯 Rozšíření admin stránky pro webhook management

### Současná stránka: `/admin/create-landing`
- ✅ Ruční vytváření landing pages
- ✅ JSON validace a formátování  
- ✅ Real-time preview

### Navrhované rozšíření: Webhook Administration

## 📋 Komponenty pro přidání:

### 1. 🔧 Webhook Settings Panel
```
┌─ Webhook Configuration ─────────────────┐
│ ✅ Webhook Status: [ENABLED/DISABLED]   │
│ 🔑 Secret Key: [Generate New] [Copy]    │
│ 📊 Rate Limit: [100] requests/minute    │
│ ⚡ Timeout: [30] seconds                │
│ 🔄 Retry Count: [3] attempts           │
└─────────────────────────────────────────┘
```

### 2. 📊 Webhook Statistics
```
┌─ Live Stats ────────────────────────────┐
│ 📈 Today: 45 webhooks (42 ✅, 3 ❌)    │
│ 📅 This week: 287 webhooks             │
│ ⚡ Avg response: 342ms                  │
│ 📊 Success rate: 96.2%                 │
└─────────────────────────────────────────┘
```

### 3. 📝 Recent Webhook Activity
```
┌─ Recent Webhooks ───────────────────────┐
│ ⏰ 14:32 ✅ "AI Tools 2025" (234ms)    │
│ ⏰ 14:28 ✅ "ChatGPT vs Claude" (456ms) │
│ ⏰ 14:25 ❌ Invalid JSON (timeout)      │
│ ⏰ 14:20 ✅ "Best AI Writing" (189ms)   │
│ [View All Logs]                        │
└─────────────────────────────────────────┘
```

### 4. 🧪 Webhook Tester
```
┌─ Test Webhook ──────────────────────────┐
│ 📡 Endpoint: /api/landing-pages         │
│ 🔑 Auth: [✅] Use webhook secret        │
│ 📋 Test Payload: [Sample] [Custom]     │
│ [🚀 Send Test Webhook]                 │
└─────────────────────────────────────────┘
```

### 5. 🚨 Failed Webhooks Management
```
┌─ Failed Webhooks ───────────────────────┐
│ ❌ 14:25 Invalid JSON - [Retry] [View]  │
│ ❌ 13:55 Timeout error - [Retry] [View] │
│ ❌ 12:30 Auth failed - [Retry] [View]   │
│ [Retry All] [Clear Failed]             │
└─────────────────────────────────────────┘
```

## 🎨 UI Layout návrh:

```
┌─ Header ────────────────────────────────────────────┐
│ 🚀 Landing Pages & Webhook Administration          │
│ Manual creation | Webhook management               │
└─────────────────────────────────────────────────────┘

┌─ Tab Navigation ────────────────────────────────────┐
│ [📝 Manual Create] [🔧 Webhook Settings] [📊 Stats]│
└─────────────────────────────────────────────────────┘

┌─ Content Area ──────────────────────────────────────┐
│ Podle vybraného tabu:                               │
│ - Manual Create (současný obsah)                   │
│ - Webhook Settings (config + logs)                 │
│ - Stats & Monitoring (grafy + metriky)             │
└─────────────────────────────────────────────────────┘
```

## 📱 Responsive design:
- Desktop: 3 sloupce (settings | stats | logs)  
- Tablet: 2 sloupce (settings | combined)
- Mobile: Stack layout (tabs pro přepínání)

## 🔒 Security features:
- Webhook secret rotation
- IP whitelist management  
- Rate limiting configuration
- Failed attempt monitoring

## 📈 Monitoring features:
- Real-time success rates
- Response time trends
- Volume tracking
- Error categorization

## 🛠️ Management features:
- Bulk retry failed webhooks
- Export webhook logs
- Download error reports
- Test webhook connectivity
