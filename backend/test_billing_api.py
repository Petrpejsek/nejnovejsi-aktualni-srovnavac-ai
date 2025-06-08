#!/usr/bin/env python3
"""
Test skript pro billing API
"""

import requests
import json
from datetime import datetime

# Konfigurace
API_BASE = "http://localhost:8000/api/v1"
TEST_TOKEN = "mock_jwt_token_for_testing"

def test_billing_endpoints():
    """Test všech billing endpointů"""
    
    print("🧪 Testování Billing API...")
    
    # Test 1: GET /billing/
    print("\n1. Test GET /billing/")
    try:
        response = requests.get(
            f"{API_BASE}/billing/", 
            headers={"Authorization": f"Bearer {TEST_TOKEN}"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: POST /billing/add-funds
    print("\n2. Test POST /billing/add-funds")
    try:
        payload = {
            "action": "add-funds",
            "offer_id": "starter-100",
            "payment_method": "card"
        }
        response = requests.post(
            f"{API_BASE}/billing/add-funds",
            headers={"Authorization": f"Bearer {TEST_TOKEN}"},
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: POST /billing/daily-limit
    print("\n3. Test POST /billing/daily-limit")
    try:
        payload = {
            "action": "update-daily-limit",
            "daily_limit": 100.0
        }
        response = requests.post(
            f"{API_BASE}/billing/daily-limit",
            headers={"Authorization": f"Bearer {TEST_TOKEN}"},
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def create_test_company():
    """Vytvoří test company v databázi"""
    print("\n🏢 Vytváření test company...")
    
    from app.database.database import SessionLocal
    from app.models.database_models import Company
    
    db = SessionLocal()
    
    try:
        # Zkontroluj, jestli company už existuje
        existing = db.query(Company).filter(Company.email == "test@company.com").first()
        if existing:
            print("Test company už existuje")
            return existing.id
        
        # Vytvoř novou test company
        test_company = Company(
            name="Test Company",
            email="test@company.com",
            hashed_password="hashed_password_here",
            contact_person="John Doe",
            website="https://test-company.com",
            description="Test company for billing API",
            balance=0.0,
            auto_recharge=False,
            status="active",
            is_verified=True
        )
        
        db.add(test_company)
        db.commit()
        db.refresh(test_company)
        
        print(f"✅ Test company vytvořena s ID: {test_company.id}")
        return test_company.id
        
    except Exception as e:
        print(f"❌ Chyba při vytváření test company: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 BILLING API TESTER")
    print("=" * 50)
    
    # Vytvoř test company
    company_id = create_test_company()
    
    if company_id:
        # Spusť testy
        test_billing_endpoints()
    else:
        print("❌ Nepodařilo se vytvořit test company")
    
    print("\n✅ Testování dokončeno!") 