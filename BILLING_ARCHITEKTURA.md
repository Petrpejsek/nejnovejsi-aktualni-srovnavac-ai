# 💳 Billing System - Architektura

## 🎯 Přehled

Billing systém používá **hybridní architekturu** s jednou databází a dvěma API vrstvami:

- **Frontend**: Next.js s React komponenty
- **Proxy Layer**: Next.js API Routes (proxy)
- **Backend**: Python FastAPI s SQLite databází
- **Databáze**: SQLite (development) / PostgreSQL (produkce)

## 🏗️ Architektura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Next.js API    │    │  Python FastAPI │
│   Frontend      │───▶│   (Proxy)        │───▶│   Backend       │
│   React UI      │    │   /api/billing   │    │   /api/v1/billing│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   SQLite DB     │
                                                │   (findai.db)   │
                                                └─────────────────┘
```

## 📁 Struktura souborů

### **Frontend (Next.js)**
```
app/company-admin/billing/page.tsx          # Billing UI komponenta
app/api/advertiser/billing/route.ts         # Proxy API endpoint
app/api/advertiser/billing/invoice/[id]/    # Invoice download
```

### **Backend (Python)**
```
backend/app/models/database_models.py       # SQLAlchemy modely
backend/app/api/billing.py                  # FastAPI endpointy
backend/app/core/security.py                # JWT autentifikace
backend/alembic/versions/                   # Databázové migrace
```

## 🔄 Data Flow

### **1. Načtení billing dat:**
```
Frontend ───▶ GET /api/advertiser/billing ───▶ GET /api/v1/billing/ ───▶ SQLite
         ◀─── billing data              ◀─── JSON response        ◀─── Company+Records
```

### **2. Přidání finančních prostředků:**
```
Frontend ───▶ POST /api/advertiser/billing ───▶ POST /api/v1/billing/add-funds ───▶ SQLite
         ◀─── success response         ◀─── transaction result            ◀─── Updated balance
```

### **3. Nastavení denního limitu:**
```
Frontend ───▶ POST /api/advertiser/billing ───▶ POST /api/v1/billing/daily-limit ───▶ SQLite
         ◀─── success response         ◀─── settings updated             ◀─── Updated company
```

## 🗃️ Databázové schéma

### **Company** (companies)
```sql
id                 INTEGER PRIMARY KEY
name              VARCHAR(255) NOT NULL
email             VARCHAR(255) UNIQUE NOT NULL
hashed_password   VARCHAR(255) NOT NULL
contact_person    VARCHAR(255) NOT NULL
website           VARCHAR(255)
description       TEXT
logo_url          VARCHAR(255)
-- Billing fields
balance           FLOAT DEFAULT 0.0
auto_recharge     BOOLEAN DEFAULT FALSE
auto_recharge_amount      FLOAT
auto_recharge_threshold   FLOAT
daily_spend_limit FLOAT
-- Meta fields
status            VARCHAR(50) DEFAULT 'active'
is_verified       BOOLEAN DEFAULT FALSE
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
last_login_at     DATETIME
```

### **BillingRecord** (billing_records)
```sql
id                INTEGER PRIMARY KEY
company_id        INTEGER NOT NULL (FK companies.id)
type              VARCHAR(50) NOT NULL    -- deposit, spend, bonus, charge
amount            FLOAT NOT NULL
description       VARCHAR(255) NOT NULL
payment_method    VARCHAR(50)             -- card, paypal, bank
payment_intent_id VARCHAR(255)            -- Stripe/PayPal ID
invoice_number    VARCHAR(100)
invoice_url       VARCHAR(500)
campaign_id       INTEGER                 -- FK campaigns.id
click_id          VARCHAR(255)
status            VARCHAR(50) DEFAULT 'completed'  -- completed, pending, failed
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
processed_at      DATETIME
```

### **Campaign** (campaigns)
```sql
id                INTEGER PRIMARY KEY
company_id        INTEGER NOT NULL (FK companies.id)
name              VARCHAR(255) NOT NULL
product_id        VARCHAR(255) NOT NULL
target_url        VARCHAR(500) NOT NULL
bid_amount        FLOAT NOT NULL
daily_budget      FLOAT NOT NULL
total_budget      FLOAT
status            VARCHAR(50) DEFAULT 'active'
is_approved       BOOLEAN DEFAULT FALSE
target_categories TEXT                    -- JSON array
target_countries  TEXT                    -- JSON array
-- Statistics
today_spent       FLOAT DEFAULT 0.0
today_impressions INTEGER DEFAULT 0
today_clicks      INTEGER DEFAULT 0
total_impressions INTEGER DEFAULT 0
total_clicks      INTEGER DEFAULT 0
total_spent       FLOAT DEFAULT 0.0
-- Dates
created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
start_date        DATETIME
end_date          DATETIME
```

## 🔧 API Endpointy

### **Next.js Proxy API**

#### `GET /api/advertiser/billing`
Načte billing informace pro přihlášenou firmu.

**Response:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": 1,
      "name": "Test Company",
      "balance": 150.0,
      "auto_recharge": false,
      "daily_spend_limit": 100.0,
      "current_daily_spend": 25.0
    },
    "transactions": [...],
    "invoices": [...],
    "period_spend": {
      "today": 25.0,
      "week": 120.0,
      "month": 450.0
    }
  }
}
```

#### `POST /api/advertiser/billing`
Zpracuje billing akce (add-funds, update-daily-limit, auto-recharge).

**Request:**
```json
{
  "action": "add-funds",
  "offerId": "starter-100",
  "paymentMethod": "card"
}
```

### **Python FastAPI Backend**

#### `GET /api/v1/billing/`
Načte billing data z databáze.

#### `POST /api/v1/billing/add-funds`
Přidá finanční prostředky a bonusy.

#### `POST /api/v1/billing/daily-limit`
Aktualizuje denní limit útraty.

#### `POST /api/v1/billing/auto-recharge`
Nastaví automatické dobíjení.

## 🔐 Autentifikace

### **JWT Token Flow**
1. Next.js vytvoří JWT token při přihlášení
2. Frontend pošle token v Authorization header
3. Next.js proxy předá token do Python API
4. Python API ověří token a načte Company data

### **Token Payload**
```json
{
  "companyId": 123,
  "email": "company@example.com",
  "exp": 1640995200
}
```

## 🚀 Deployment

### **Development**
```bash
# Spustit Python backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Spustit Next.js frontend
cd ..
npm run dev
```

### **Production Environment Variables**
```env
# Next.js
PYTHON_API_URL="https://api.yourserver.com/api/v1"
JWT_SECRET="your-production-secret"

# Python FastAPI
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-production-secret"
```

## ✅ Výhody této architektury

1. **Jednotná databáze** - Žádný chaos s více databázemi
2. **Flexibilita** - Python pro složité operace, Next.js pro UI
3. **Škálovatelnost** - Python backend lze snadně škálovat
4. **Bezpečnost** - JWT autentifikace na obou vrstvách
5. **Testovatelnost** - Každá vrstva je nezávisle testovatelná

## 🧪 Testování

```bash
# Test Python API
cd backend
python test_billing_api.py

# Test Next.js integration
curl -X GET http://localhost:3000/api/advertiser/billing \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Monitoring & Logs

- **Next.js**: Console logs v prohlížeči + Vercel logs
- **Python**: FastAPI logs + SQLite query logs
- **Database**: Alembic migration history

---

## 🎯 Závěr

Tato architektura poskytuje:
- ✅ Jednu databázi (žádný chaos)
- ✅ Oddělené zodpovědnosti (UI vs. Business logic)
- ✅ Snadný deployment na externí server
- ✅ Škálovatelnost a maintainability 