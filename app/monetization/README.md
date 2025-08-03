# 💰 Portable Monetization System

A fully modular monetization system supporting CPC, affiliate, and hybrid monetization models. Designed for maximum portability and reusability across different projects.

## 🚀 Features

- **🎯 Multi-Mode Monetization**: CPC, Affiliate, and Hybrid modes
- **🔄 Smart Redirects**: `/out/:type/:id?ref=xxx` with tracking
- **💳 Stripe Integration**: Credit purchases and automated invoicing
- **📊 Advanced Analytics**: Real-time tracking and reporting
- **🛡️ Fraud Detection**: Built-in click validation and fraud prevention
- **🔧 Portable Design**: No dependencies on specific entity types
- **⚡ High Performance**: Optimized database queries and caching

## 🏗️ Architecture

```
/app/monetization/
├── models.py          # Database models (SQLAlchemy)
├── schema.py          # API schemas (Pydantic)
├── routes.py          # FastAPI endpoints
├── services.py        # Business logic
├── utils.py           # Helper functions
└── README.md          # This file
```

## 🔧 Installation & Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database (if different from main app)
MONETIZATION_DATABASE_URL=postgresql://user:pass@host:port/db

# Optional: Fraud Detection
MAXMIND_LICENSE_KEY=your_key_here
```

### 2. Database Migration

Create Alembic migration for the new tables:

```bash
# Generate migration
alembic revision --autogenerate -m "Add monetization tables"

# Apply migration  
alembic upgrade head
```

### 3. FastAPI Integration

Add to your main FastAPI app:

```python
from app.monetization.routes import router as monetization_router

app.include_router(monetization_router)
```

### 4. Frontend Integration

Update your product/tool cards to use the monetization redirect:

```javascript
// Instead of direct external links
window.open(tool.externalUrl, '_blank')

// Use monetization redirect
window.open(`/monetization/out/Tool/${tool.id}?ref=${tool.refCode}`, '_blank')
```

## 📖 Usage Guide

### Creating Monetization Configuration

```python
from app.monetization import MonetizationService, MonetizationConfigCreate

service = MonetizationService(db)

# CPC Mode
config = service.create_config(MonetizationConfigCreate(
    monetizable_type="Tool",
    monetizable_id="123",
    mode="cpc",
    ref_code="openai-gpt4",
    partner_id="partner_uuid",
    cpc_rate=0.50,
    fallback_link="https://openai.com"
))

# Affiliate Mode  
config = service.create_config(MonetizationConfigCreate(
    monetizable_type="Product", 
    monetizable_id="456",
    mode="affiliate",
    ref_code="shopify-pro",
    partner_id="partner_uuid",
    affiliate_link="https://shopify.com?ref=shopify-pro",
    affiliate_rate=10.0  # 10% commission
))

# Hybrid Mode (both CPC and affiliate)
config = service.create_config(MonetizationConfigCreate(
    monetizable_type="Service",
    monetizable_id="789", 
    mode="hybrid",
    ref_code="canva-premium",
    partner_id="partner_uuid",
    cpc_rate=0.25,
    affiliate_link="https://canva.com?ref=canva-premium",
    affiliate_rate=15.0
))
```

### Setting up Billing Account

```python
from app.monetization import BillingService

billing = BillingService(db)

# Create billing account with auto-recharge
account = billing.get_or_create_account("partner_uuid")
account.auto_recharge_enabled = True
account.auto_recharge_threshold = 50.0  # Recharge when balance < $50
account.auto_recharge_amount = 200.0    # Add $200 each time
```

### Handling Redirects

The main redirect endpoint automatically handles tracking:

```
GET /monetization/out/Tool/123?ref=openai-gpt4
```

This will:
1. Find monetization config by ref code
2. Track affiliate click (if affiliate/hybrid mode)
3. Charge CPC and track ad click (if CPC/hybrid mode) 
4. Redirect to affiliate/external URL

### Tracking Conversions

#### Webhook Method
```python
# Partner calls your webhook when conversion happens
POST /monetization/api/affiliate/conversion
{
    "ref_code": "openai-gpt4",
    "conversion_type": "subscription", 
    "conversion_value": 20.0,
    "currency": "USD"
}
```

#### Pixel Method
```html
<!-- Partner adds to their conversion page -->
<img src="/monetization/track/conversion.gif?ref=openai-gpt4&type=subscription&value=20" 
     width="1" height="1" style="display:none">
```

### Managing Credits

```python
from app.monetization import StripeService

stripe_service = StripeService(db, stripe_secret_key)

# Create checkout session for credit purchase
result = stripe_service.create_credit_checkout_session(
    partner_id="partner_uuid",
    amount=500.0,  # $500
    success_url="https://yourapp.com/success",
    cancel_url="https://yourapp.com/cancel"
)

# Redirect user to result["checkout_url"]
```

### Generating Invoices

```python
# Create affiliate commission invoice
invoice = stripe_service.create_affiliate_invoice(
    partner_id="partner_uuid",
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 1, 31)
)

# Invoice automatically sent to customer
print(f"Invoice created: {invoice['invoice_url']}")
```

## 🔌 API Endpoints

### Core Redirect
- `GET /monetization/out/{type}/{id}?ref=xxx` - Main redirect with tracking

### Configuration
- `POST /monetization/config` - Create monetization config
- `GET /monetization/config/{id}` - Get config by ID
- `PUT /monetization/config/{id}` - Update config
- `GET /monetization/config/ref/{ref_code}` - Get config by ref code
- `GET /monetization/config/entity/{type}/{id}` - Get configs for entity

### Billing
- `POST /monetization/billing/account` - Create billing account
- `GET /monetization/billing/account/{partner_id}` - Get billing account
- `PUT /monetization/billing/account/{partner_id}` - Update billing account

### Stripe
- `POST /monetization/stripe/purchase-credit` - Create credit checkout session
- `POST /monetization/stripe/create-invoice` - Create affiliate invoice
- `POST /monetization/stripe/webhook` - Handle Stripe webhooks

### Tracking
- `POST /monetization/api/affiliate/conversion` - Track conversion (webhook)
- `GET /monetization/track/conversion.gif` - Track conversion (pixel)

### Analytics
- `GET /monetization/analytics/partner/{id}` - Partner analytics
- `GET /monetization/analytics/entity/{type}/{id}` - Entity analytics
- `GET /monetization/admin/stats` - System-wide stats

## 🔒 Security Features

### IP Hashing
All IP addresses are hashed with SHA-256 for privacy compliance:
```python
ip_hash = hashlib.sha256(f"{ip_address}salt".encode()).hexdigest()[:16]
```

### Fraud Detection
Built-in fraud detection checks:
- Bot user agents
- Suspicious referrers  
- Click velocity (TODO)
- Device fingerprinting (TODO)

### Webhook Verification
Stripe webhooks are automatically verified:
```python
stripe.Webhook.construct_event(payload, signature, webhook_secret)
```

## 📊 Database Schema

### MonetizationConfig
Main configuration table linking any entity to monetization settings.

### AffiliateClick  
Tracks all affiliate clicks with full metadata.

### AdClick
Tracks CPC clicks with billing information.

### AffiliateConversion
Records conversions from affiliate clicks.

### BillingAccount
Manages partner credit balances and billing settings.

## 🎨 Frontend Integration Examples

### React Component
```jsx
import { useMonetization } from './hooks/useMonetization';

function ToolCard({ tool }) {
  const { trackClick } = useMonetization();
  
  const handleVisit = () => {
    // Track and redirect
    trackClick('Tool', tool.id, tool.refCode);
  };
  
  return (
    <div className="tool-card">
      <h3>{tool.name}</h3>
      <button onClick={handleVisit}>
        Visit Tool
      </button>
    </div>
  );
}
```

### Vue.js Component
```vue
<template>
  <div class="tool-card">
    <h3>{{ tool.name }}</h3>
    <button @click="handleVisit">Visit Tool</button>
  </div>
</template>

<script>
export default {
  props: ['tool'],
  methods: {
    handleVisit() {
      const url = `/monetization/out/Tool/${this.tool.id}?ref=${this.tool.refCode}`;
      window.open(url, '_blank');
    }
  }
}
</script>
```

## 🔄 Migration from Existing Systems

### From Direct Links
```javascript
// OLD: Direct external links
window.open(tool.externalUrl, '_blank');

// NEW: Monetized redirects  
window.open(`/monetization/out/Tool/${tool.id}?ref=${tool.refCode}`, '_blank');
```

### From Existing CPC System
1. Export existing campaign data
2. Create MonetizationConfig entries
3. Update billing accounts
4. Migrate click history (optional)

## 🧪 Testing

### Unit Tests
```bash
pytest app/monetization/tests/
```

### Load Testing
```bash
# Test redirect endpoint
ab -n 1000 -c 10 http://localhost:8000/monetization/out/Tool/123?ref=test
```

### Stripe Testing
Use Stripe test mode with test cards:
- `4242424242424242` - Visa success
- `4000000000000002` - Card declined

## 📈 Analytics & Monitoring

### Key Metrics
- Click-through rates by entity type
- Conversion rates by partner
- Revenue per click
- Fraud detection accuracy

### Monitoring Setup
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('monetization')
```

## 🔧 Advanced Configuration

### Custom Fraud Detection
```python
from app.monetization.utils import detect_fraud_indicators

def custom_fraud_detection(ip_hash, user_agent, referrer):
    indicators = detect_fraud_indicators(ip_hash, user_agent, referrer)
    
    # Add custom rules
    if user_agent and 'suspicious-bot' in user_agent:
        indicators['fraud_score'] += 100
        indicators['indicators'].append('custom_bot_detection')
    
    return indicators
```

### Custom Reference Code Generation
```python
from app.monetization.utils import generate_ref_code

# Generate branded ref codes
ref_code = generate_ref_code(prefix='tool', length=6)
# Result: 'tool-abc123'
```

## 🚀 Deployment

### Docker Support
```dockerfile
FROM python:3.9

COPY app/monetization /app/monetization
RUN pip install -r requirements.txt

ENV STRIPE_SECRET_KEY=sk_live_...
ENV DATABASE_URL=postgresql://...

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment-Specific Config
```python
# config.py
import os

class MonetizationConfig:
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
    FRAUD_DETECTION_ENABLED = os.getenv('FRAUD_DETECTION', 'true').lower() == 'true'
    MIN_CREDIT_PURCHASE = float(os.getenv('MIN_CREDIT_PURCHASE', '100'))
```

## 📞 Support

For support with the monetization system:

1. Check the logs for error details
2. Verify Stripe webhook configuration
3. Test with Stripe test mode first
4. Monitor database performance with analytics queries

## 🔄 Portability Notes

This system is designed to be **completely portable**:

- ✅ No hardcoded entity types (uses `monetizable_type` + `monetizable_id`)
- ✅ Self-contained database schema
- ✅ Configurable Stripe integration
- ✅ Framework-agnostic (FastAPI, but easily adaptable)
- ✅ No external dependencies beyond Stripe

To port to a new project:
1. Copy the entire `/app/monetization/` folder
2. Update database imports in `models.py`
3. Configure environment variables
4. Run database migrations
5. Include routes in your FastAPI app

## 📋 TODO / Roadmap

- [ ] Enhanced fraud detection with ML models
- [ ] Real-time analytics dashboard
- [ ] A/B testing for CPC rates
- [ ] Multi-currency support
- [ ] Webhook retry mechanisms
- [ ] Click attribution modeling
- [ ] Performance optimizations
- [ ] Integration with external analytics (Google Analytics, etc.)