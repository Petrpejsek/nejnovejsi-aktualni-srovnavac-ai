from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    price = Column(Float)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # Billing fields
    balance = Column(Float, default=0.0)
    auto_recharge = Column(Boolean, default=False)
    auto_recharge_amount = Column(Float, nullable=True)
    auto_recharge_threshold = Column(Float, nullable=True)
    daily_spend_limit = Column(Float, nullable=True)
    
    # Meta fields
    status = Column(String, default="active")
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    billing_records = relationship("BillingRecord", back_populates="company")
    campaigns = relationship("Campaign", back_populates="company")

class BillingRecord(Base):
    __tablename__ = "billing_records"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    type = Column(String, nullable=False)  # deposit, spend, bonus, charge
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    payment_method = Column(String, nullable=True)
    payment_intent_id = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    invoice_url = Column(String, nullable=True)
    campaign_id = Column(Integer, nullable=True)
    click_id = Column(String, nullable=True)
    status = Column(String, default="completed")  # completed, pending, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="billing_records")

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    product_id = Column(String, nullable=False)
    target_url = Column(String, nullable=False)
    bid_amount = Column(Float, nullable=False)
    daily_budget = Column(Float, nullable=False)
    total_budget = Column(Float, nullable=True)
    status = Column(String, default="active")
    is_approved = Column(Boolean, default=False)
    target_categories = Column(Text, nullable=True)  # JSON
    target_countries = Column(Text, nullable=True)   # JSON
    
    # Stats
    today_spent = Column(Float, default=0.0)
    today_impressions = Column(Integer, default=0)
    today_clicks = Column(Integer, default=0)
    total_impressions = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    
    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="campaigns") 