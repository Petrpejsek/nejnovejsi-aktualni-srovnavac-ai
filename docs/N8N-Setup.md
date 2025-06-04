# 🔧 Nastavení N8N Workflow pro AI vyhledávání

## 📋 Přehled

Tento dokument popisuje, jak nastavit N8N workflow pro zpracování AI vyhledávání nástrojů.

## 🛠️ Požadované environment variables

Před spuštěním systému nastavte tyto proměnné:

```bash
# V .env.local
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/ai-search"
N8N_API_TOKEN="your-n8n-api-token"
OPENAI_API_KEY="sk-your-openai-api-key"
FRONTEND_CALLBACK_URL="http://localhost:3000"
```

## 🏗️ Struktura N8N Workflow

### 1. Webhook Trigger Node
- **Typ**: `Webhook`
- **HTTP Method**: `POST`
- **Path**: `ai-search`
- **Authentication**: Bearer Token (optional)

**Očekávaná data:**
```json
{
  "query": "string",
  "sessionId": "string", 
  "timestamp": "number",
  "source": "homepage",
  "userAgent": "string",
  "locale": "cs-CZ",
  "metadata": {
    "clientIP": "string",
    "referer": "string",
    "origin": "string",
    "requestTime": "string"
  }
}
```

### 2. Parse Query Node
- **Typ**: `Code`
- **Název**: `Parse Query`

```javascript
// Analyze query and extract key information
const query = $input.first().json.query;
const sessionId = $input.first().json.sessionId;

// Quick categorization
const categories = extractCategories(query);
const intent = analyzeIntent(query);
const urgency = assessUrgency(query);

function extractCategories(q) {
  const cats = [];
  const lowercaseQ = q.toLowerCase();
  
  if (lowercaseQ.includes('video') || lowercaseQ.includes('youtube')) cats.push('video-generation');
  if (lowercaseQ.includes('email') || lowercaseQ.includes('marketing')) cats.push('email-marketing');
  if (lowercaseQ.includes('website') || lowercaseQ.includes('web')) cats.push('website-builder');
  if (lowercaseQ.includes('automation') || lowercaseQ.includes('automate')) cats.push('automation');
  if (lowercaseQ.includes('accounting') || lowercaseQ.includes('invoice')) cats.push('accounting');
  if (lowercaseQ.includes('chat') || lowercaseQ.includes('support')) cats.push('customer-service');
  if (lowercaseQ.includes('seo') || lowercaseQ.includes('search engine')) cats.push('seo');
  if (lowercaseQ.includes('design') || lowercaseQ.includes('graphic')) cats.push('design');
  if (lowercaseQ.includes('ai') || lowercaseQ.includes('artificial intelligence')) cats.push('ai-tools');
  
  return cats;
}

function analyzeIntent(q) {
  const lowercaseQ = q.toLowerCase();
  if (lowercaseQ.includes('automation') || lowercaseQ.includes('workflow')) return 'automation';
  if (lowercaseQ.includes('create') || lowercaseQ.includes('build')) return 'creation';
  if (lowercaseQ.includes('analyze') || lowercaseQ.includes('analytics')) return 'analytics';
  if (lowercaseQ.includes('manage') || lowercaseQ.includes('management')) return 'management';
  if (lowercaseQ.includes('learn') || lowercaseQ.includes('study')) return 'learning';
  return 'general';
}

function assessUrgency(q) {
  const lowercaseQ = q.toLowerCase();
  if (lowercaseQ.includes('urgent') || lowercaseQ.includes('quickly') || lowercaseQ.includes('asap')) return 'high';
  return 'normal';
}

return [{
  sessionId,
  originalQuery: query,
  categories,
  intent,
  urgency,
  timestamp: Date.now(),
  processedAt: new Date().toISOString()
}];
```

### 3. Load Products Node
- **Typ**: `HTTP Request` nebo `Postgres`
- **Název**: `Load Products`

**Pro HTTP Request:**
```json
{
  "method": "GET",
  "url": "{{ $env.FRONTEND_CALLBACK_URL }}/api/products?format=minimal",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

**Pro Postgres:**
```sql
SELECT 
  id, title, description, category, price, website,
  advantages, disadvantages, tags
FROM products 
WHERE 
  CASE 
    WHEN $1::text[] IS NOT NULL AND array_length($1::text[], 1) > 0 
    THEN category = ANY($1::text[])
    ELSE true
  END
ORDER BY popularity_score DESC
LIMIT 50;
```

### 4. OpenAI Analysis Node
- **Typ**: `OpenAI`
- **Model**: `gpt-4-turbo-preview` nebo `gpt-3.5-turbo`
- **Název**: `OpenAI Analysis`

#### Prompty pro OpenAI nod:

**System Prompt**:
```
You are an AI tools expert and advisor for selecting the right technologies. Analyze the user's query and select 5-8 most relevant tools from the provided list.

For each selected tool, create:
1. Match score (85-99%) - how well the tool meets the requirements
2. Personalized recommendation (2-3 sentences in English)
3. Main benefits for the specific use case

Return your response as JSON with the key 'recommendations'.
```

**User Prompt**:
```
User is looking for: {{ $(Parse Query).first().json.originalQuery }}

Detected categories: {{ $('Parse Query').first().json.categories }}

Intent: {{ $('Parse Query').first().json.intent }}

Available tools:
{{ $('Load Products').item.json.map(tool => `ID: ${tool.id}\nName: ${tool.name}\nCategory: ${tool.category || 'General'}\nDescription: ${tool.description || 'No description'}\nTags: ${tool.tags || []}\nAdvantages: ${tool.advantages || []}\n`).join('\n\n') }}
```

### 5. Personalization Engine Node
- **Typ**: `Code`
- **Název**: `Personalization Engine`

```javascript
// Personalization based on user profile
const aiResponse = $input.first().json;
const sessionData = $('Parse Query').first().json;

// Parse OpenAI response
let recommendations;
try {
  if (typeof aiResponse.choices !== 'undefined') {
    // OpenAI node response
    const content = aiResponse.choices[0].message.content;
    recommendations = JSON.parse(content).recommendations;
  } else {
    // Fallback - direct JSON
    recommendations = aiResponse.recommendations || [];
  }
} catch (error) {
  console.error('Error parsing AI response:', error);
  recommendations = [];
}

// Add personalization
const personalizedRecs = recommendations.map(rec => {
  return {
    ...rec,
    personalizedReason: generatePersonalReason(rec, sessionData),
    urgencyBonus: sessionData.urgency === 'high' ? 5 : 0,
    contextualTips: getContextualTips(rec, sessionData.intent)
  };
});

function generatePersonalReason(rec, session) {
  const reasons = [];
  
  if (session.intent === 'automation') {
    reasons.push('Saves you hours of work weekly through automation');
  }
  if (session.intent === 'creation') {
    reasons.push('Quickly create professional results');
  }
  if (session.urgency === 'high') {
    reasons.push('Can be used immediately');
  }
  if (rec.matchPercentage > 95) {
    reasons.push('Perfectly matches your requirements');
  }
  
  return reasons.join(', ');
}

function getContextualTips(rec, intent) {
  const tips = [];
  
  if (intent === 'creation') {
    tips.push('💡 Tip: Start with the free version and gradually move to paid');
  }
  if (intent === 'automation') {
    tips.push('⚡ Tip: Set up your workflow gradually, starting with simple tasks');
  }
  if (intent === 'analytics') {
    tips.push('📊 Tip: Connect with other tools to maximize your insights');
  }
  
  return tips;
}

return [{
  sessionId: sessionData.sessionId,
  query: sessionData.originalQuery,
  recommendations: personalizedRecs,
  totalFound: personalizedRecs.length,
  processingTime: Date.now() - sessionData.timestamp,
  metadata: {
    categories: sessionData.categories,
    intent: sessionData.intent,
    urgency: sessionData.urgency
  }
}];
```

### 6. Send to Frontend Node
- **Typ**: `HTTP Request`
- **Název**: `Send to Frontend`

```json
{
  "method": "POST",
  "url": "{{ $env.FRONTEND_CALLBACK_URL }}/api/search-results",
  "headers": {
    "Content-Type": "application/json",
    "Accept-Language": "en-US"
  },
  "body": {
    "sessionId": "{{ $('Personalization Engine').first().json.sessionId }}",
    "query": "{{ $('Personalization Engine').first().json.query }}",
    "recommendations": {{ $json['recommendations'] }},
    "totalFound": {{ $json['totalFound'] }},
    "processingTime": {{ $json['processingTime'] }},
    "language": "en-US"
  }
}
```

### 7. Store Analytics Node (Optional)
- **Typ**: `Postgres` nebo `HTTP Request`
- **Název**: `Store Analytics`

```sql
INSERT INTO search_analytics (
  session_id, query, categories, intent, urgency, 
  results_count, processing_time, language, created_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, 'en', NOW()
);
```

Nebo pro HTTP API verzi:

```json
{
  "method": "POST",
  "url": "{{ $env.ANALYTICS_API_URL }}/api/search-log",
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "{{ $env.ANALYTICS_API_KEY }}"
  },
  "body": {
    "sessionId": "{{ $('Personalization Engine').first().json.sessionId }}",
    "query": "{{ $('Personalization Engine').first().json.query }}",
    "categories": {{ $json.metadata.categories }},
    "intent": "{{ $json.metadata.intent }}",
    "urgency": "{{ $json.metadata.urgency }}",
    "resultsCount": {{ $json.totalFound }},
    "processingTime": {{ $json.processingTime }},
    "language": "en",
    "timestamp": "{{ $now }}"
  }
}
```

## 🔗 Připojení nodů

1. **Webhook Trigger** → **Parse Query**
2. **Parse Query** → **Load Products**
3. **Load Products** → **OpenAI Analysis**
4. **OpenAI Analysis** → **Personalization Engine**
5. **Personalization Engine** → **Send to Frontend**
6. **Personalization Engine** → **Store Analytics** (parallel)

## ✅ Testování

1. Aktivujte workflow v N8N
2. Nastavte webhook URL ve frontend aplikaci
3. Otestujte na `/new-search` stránce
4. Zkontrolujte logy v N8N i frontend konzoli

## 🚨 Troubleshooting

### Časté problémy:

1. **Webhook se nevolá**
   - Zkontrolujte `N8N_WEBHOOK_URL` v `.env.local`
   - Ověřte, že N8N instance je dostupná

2. **OpenAI timeout**
   - Snižte počet produktů v Load Products (max 50)
   - Zkraťte system message

3. **Frontend nedostává výsledky**
   - Zkontrolujte `FRONTEND_CALLBACK_URL`
   - Ověřte CORS nastavení

4. **Parsing chyby**
   - Zkontrolujte JSON strukturu v Personalization Engine
   - Přidejte try-catch bloky

## 📈 Optimalizace

- Použijte Redis cache pro Load Products
- Implementujte retry logiku pro HTTP requesty
- Přidejte monitoring a alerting
- Optimalizujte OpenAI prompty pro rychlost 