"""
Alembic Migration: Create Monetization Tables

Creates all required tables for the portable monetization system.
Run: alembic upgrade head
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'monetization_001'
down_revision = None  # or your current latest revision
branch_labels = None
depends_on = None


def upgrade():
    """Create monetization tables"""
    
    # Create monetization_configs table
    op.create_table(
        'monetization_configs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('monetizable_type', sa.String(), nullable=False),
        sa.Column('monetizable_id', sa.String(), nullable=False),
        sa.Column('mode', sa.Enum('cpc', 'affiliate', 'hybrid', name='monetizationmode'), nullable=False),
        sa.Column('ref_code', sa.String(), nullable=False),
        sa.Column('affiliate_link', sa.Text(), nullable=True),
        sa.Column('fallback_link', sa.Text(), nullable=True),
        sa.Column('is_top', sa.Boolean(), nullable=True, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('partner_id', sa.String(), nullable=False),
        sa.Column('cpc_rate', sa.Float(), nullable=True),
        sa.Column('affiliate_rate', sa.Float(), nullable=True),
        sa.Column('total_clicks', sa.Integer(), nullable=True, default=0),
        sa.Column('total_affiliate_clicks', sa.Integer(), nullable=True, default=0),
        sa.Column('total_cpc_clicks', sa.Integer(), nullable=True, default=0),
        sa.Column('total_conversions', sa.Integer(), nullable=True, default=0),
        sa.Column('total_revenue', sa.Float(), nullable=True, default=0.0),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for monetization_configs
    op.create_index('idx_monetizable_entity', 'monetization_configs', ['monetizable_type', 'monetizable_id'])
    op.create_index('idx_partner_active', 'monetization_configs', ['partner_id', 'is_active'])
    op.create_index('idx_mode_active', 'monetization_configs', ['mode', 'is_active'])
    op.create_index('ix_monetization_configs_monetizable_type', 'monetization_configs', ['monetizable_type'])
    op.create_index('ix_monetization_configs_monetizable_id', 'monetization_configs', ['monetizable_id'])
    op.create_index('ix_monetization_configs_ref_code', 'monetization_configs', ['ref_code'])
    op.create_index('ix_monetization_configs_partner_id', 'monetization_configs', ['partner_id'])
    op.create_unique_constraint('uq_monetization_configs_ref_code', 'monetization_configs', ['ref_code'])
    
    # Create affiliate_clicks table
    op.create_table(
        'affiliate_clicks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('monetizable_type', sa.String(), nullable=False),
        sa.Column('monetizable_id', sa.String(), nullable=False),
        sa.Column('ref_code', sa.String(), nullable=False),
        sa.Column('partner_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('ip_hash', sa.String(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('referrer', sa.Text(), nullable=True),
        sa.Column('click_source', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('is_valid', sa.Boolean(), nullable=True, default=True),
        sa.Column('fraud_reason', sa.String(), nullable=True),
        sa.Column('conversion_id', sa.String(), nullable=True),
        sa.Column('is_converted', sa.Boolean(), nullable=True, default=False),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for affiliate_clicks
    op.create_index('idx_affiliate_entity', 'affiliate_clicks', ['monetizable_type', 'monetizable_id'])
    op.create_index('idx_affiliate_partner', 'affiliate_clicks', ['partner_id', 'timestamp'])
    op.create_index('idx_affiliate_ref', 'affiliate_clicks', ['ref_code', 'timestamp'])
    op.create_index('idx_affiliate_session', 'affiliate_clicks', ['session_id', 'timestamp'])
    op.create_index('ix_affiliate_clicks_monetizable_type', 'affiliate_clicks', ['monetizable_type'])
    op.create_index('ix_affiliate_clicks_monetizable_id', 'affiliate_clicks', ['monetizable_id'])
    op.create_index('ix_affiliate_clicks_ref_code', 'affiliate_clicks', ['ref_code'])
    op.create_index('ix_affiliate_clicks_partner_id', 'affiliate_clicks', ['partner_id'])
    op.create_index('ix_affiliate_clicks_timestamp', 'affiliate_clicks', ['timestamp'])
    op.create_index('ix_affiliate_clicks_session_id', 'affiliate_clicks', ['session_id'])
    
    # Create ad_clicks_monetization table
    op.create_table(
        'ad_clicks_monetization',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('monetizable_type', sa.String(), nullable=False),
        sa.Column('monetizable_id', sa.String(), nullable=False),
        sa.Column('campaign_id', sa.String(), nullable=True),
        sa.Column('partner_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('ip_hash', sa.String(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('referrer', sa.Text(), nullable=True),
        sa.Column('cost_per_click', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=False, default='USD'),
        sa.Column('is_valid_click', sa.Boolean(), nullable=True, default=True),
        sa.Column('fraud_reason', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('conversion_tracked', sa.Boolean(), nullable=True, default=False),
        sa.Column('conversion_value', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for ad_clicks_monetization
    op.create_index('idx_adclick_entity', 'ad_clicks_monetization', ['monetizable_type', 'monetizable_id'])
    op.create_index('idx_adclick_partner', 'ad_clicks_monetization', ['partner_id', 'timestamp'])
    op.create_index('idx_adclick_campaign', 'ad_clicks_monetization', ['campaign_id', 'timestamp'])
    op.create_index('idx_adclick_billing', 'ad_clicks_monetization', ['partner_id', 'cost_per_click'])
    op.create_index('ix_ad_clicks_monetization_monetizable_type', 'ad_clicks_monetization', ['monetizable_type'])
    op.create_index('ix_ad_clicks_monetization_monetizable_id', 'ad_clicks_monetization', ['monetizable_id'])
    op.create_index('ix_ad_clicks_monetization_campaign_id', 'ad_clicks_monetization', ['campaign_id'])
    op.create_index('ix_ad_clicks_monetization_partner_id', 'ad_clicks_monetization', ['partner_id'])
    op.create_index('ix_ad_clicks_monetization_timestamp', 'ad_clicks_monetization', ['timestamp'])
    
    # Create affiliate_conversions table
    op.create_table(
        'affiliate_conversions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('affiliate_click_id', sa.String(), nullable=True),
        sa.Column('ref_code', sa.String(), nullable=False),
        sa.Column('partner_id', sa.String(), nullable=False),
        sa.Column('monetizable_type', sa.String(), nullable=False),
        sa.Column('monetizable_id', sa.String(), nullable=False),
        sa.Column('conversion_type', sa.Enum('registration', 'trial_start', 'subscription', 'purchase', 'lead', 'custom', name='conversiontype'), nullable=False),
        sa.Column('conversion_value', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True, default='USD'),
        sa.Column('commission_rate', sa.Float(), nullable=True),
        sa.Column('commission_amount', sa.Float(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('attribution_window_hours', sa.Integer(), nullable=True, default=720),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('external_conversion_id', sa.String(), nullable=True),
        sa.Column('metadata', sa.Text(), nullable=True),
        sa.Column('is_billable', sa.Boolean(), nullable=True, default=True),
        sa.Column('billed_at', sa.DateTime(), nullable=True),
        sa.Column('invoice_id', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for affiliate_conversions
    op.create_index('idx_conversion_entity', 'affiliate_conversions', ['monetizable_type', 'monetizable_id'])
    op.create_index('idx_conversion_partner', 'affiliate_conversions', ['partner_id', 'timestamp'])
    op.create_index('idx_conversion_billing', 'affiliate_conversions', ['partner_id', 'is_billable', 'billed_at'])
    op.create_index('idx_conversion_ref', 'affiliate_conversions', ['ref_code', 'timestamp'])
    op.create_index('ix_affiliate_conversions_affiliate_click_id', 'affiliate_conversions', ['affiliate_click_id'])
    op.create_index('ix_affiliate_conversions_ref_code', 'affiliate_conversions', ['ref_code'])
    op.create_index('ix_affiliate_conversions_partner_id', 'affiliate_conversions', ['partner_id'])
    op.create_index('ix_affiliate_conversions_monetizable_type', 'affiliate_conversions', ['monetizable_type'])
    op.create_index('ix_affiliate_conversions_monetizable_id', 'affiliate_conversions', ['monetizable_id'])
    op.create_index('ix_affiliate_conversions_timestamp', 'affiliate_conversions', ['timestamp'])
    op.create_index('ix_affiliate_conversions_session_id', 'affiliate_conversions', ['session_id'])
    
    # Create billing_accounts table
    op.create_table(
        'billing_accounts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('partner_id', sa.String(), nullable=False),
        sa.Column('stripe_customer_id', sa.String(), nullable=True),
        sa.Column('credit_balance', sa.Float(), nullable=False, default=0.0),
        sa.Column('total_deposited', sa.Float(), nullable=True, default=0.0),
        sa.Column('total_spent', sa.Float(), nullable=True, default=0.0),
        sa.Column('auto_recharge_enabled', sa.Boolean(), nullable=True, default=False),
        sa.Column('auto_recharge_threshold', sa.Float(), nullable=True, default=50.0),
        sa.Column('auto_recharge_amount', sa.Float(), nullable=True, default=200.0),
        sa.Column('daily_spend_limit', sa.Float(), nullable=True),
        sa.Column('monthly_spend_limit', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True, default=False),
        sa.Column('credit_limit', sa.Float(), nullable=True, default=1000.0),
        sa.Column('affiliate_billing_enabled', sa.Boolean(), nullable=True, default=False),
        sa.Column('affiliate_billing_threshold', sa.Float(), nullable=True, default=10.0),
        sa.Column('last_affiliate_invoice_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('last_activity_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('metadata', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for billing_accounts
    op.create_index('idx_billing_partner', 'billing_accounts', ['partner_id', 'is_active'])
    op.create_index('idx_billing_stripe', 'billing_accounts', ['stripe_customer_id'])
    op.create_index('idx_billing_balance', 'billing_accounts', ['credit_balance', 'auto_recharge_enabled'])
    op.create_unique_constraint('uq_billing_accounts_partner_id', 'billing_accounts', ['partner_id'])
    op.create_unique_constraint('uq_billing_accounts_stripe_customer_id', 'billing_accounts', ['stripe_customer_id'])
    
    # Create additional cross-table indexes for performance
    op.create_index('idx_clicks_partner_time', 'affiliate_clicks', ['partner_id', 'timestamp'])
    op.create_index('idx_adclicks_partner_time', 'ad_clicks_monetization', ['partner_id', 'timestamp'])
    op.create_index('idx_conversions_partner_time', 'affiliate_conversions', ['partner_id', 'timestamp'])


def downgrade():
    """Drop monetization tables"""
    
    # Drop indexes first
    op.drop_index('idx_conversions_partner_time', table_name='affiliate_conversions')
    op.drop_index('idx_adclicks_partner_time', table_name='ad_clicks_monetization')
    op.drop_index('idx_clicks_partner_time', table_name='affiliate_clicks')
    
    # Drop billing_accounts table and its indexes
    op.drop_index('idx_billing_balance', table_name='billing_accounts')
    op.drop_index('idx_billing_stripe', table_name='billing_accounts')
    op.drop_index('idx_billing_partner', table_name='billing_accounts')
    op.drop_table('billing_accounts')
    
    # Drop affiliate_conversions table and its indexes
    op.drop_index('ix_affiliate_conversions_session_id', table_name='affiliate_conversions')
    op.drop_index('ix_affiliate_conversions_timestamp', table_name='affiliate_conversions')
    op.drop_index('ix_affiliate_conversions_monetizable_id', table_name='affiliate_conversions')
    op.drop_index('ix_affiliate_conversions_monetizable_type', table_name='affiliate_conversions')
    op.drop_index('ix_affiliate_conversions_partner_id', table_name='affiliate_conversions')
    op.drop_index('ix_affiliate_conversions_ref_code', table_name='affiliate_conversions')
    op.drop_index('ix_affiliate_conversions_affiliate_click_id', table_name='affiliate_conversions')
    op.drop_index('idx_conversion_ref', table_name='affiliate_conversions')
    op.drop_index('idx_conversion_billing', table_name='affiliate_conversions')
    op.drop_index('idx_conversion_partner', table_name='affiliate_conversions')
    op.drop_index('idx_conversion_entity', table_name='affiliate_conversions')
    op.drop_table('affiliate_conversions')
    
    # Drop ad_clicks_monetization table and its indexes
    op.drop_index('ix_ad_clicks_monetization_timestamp', table_name='ad_clicks_monetization')
    op.drop_index('ix_ad_clicks_monetization_partner_id', table_name='ad_clicks_monetization')
    op.drop_index('ix_ad_clicks_monetization_campaign_id', table_name='ad_clicks_monetization')
    op.drop_index('ix_ad_clicks_monetization_monetizable_id', table_name='ad_clicks_monetization')
    op.drop_index('ix_ad_clicks_monetization_monetizable_type', table_name='ad_clicks_monetization')
    op.drop_index('idx_adclick_billing', table_name='ad_clicks_monetization')
    op.drop_index('idx_adclick_campaign', table_name='ad_clicks_monetization')
    op.drop_index('idx_adclick_partner', table_name='ad_clicks_monetization')
    op.drop_index('idx_adclick_entity', table_name='ad_clicks_monetization')
    op.drop_table('ad_clicks_monetization')
    
    # Drop affiliate_clicks table and its indexes
    op.drop_index('ix_affiliate_clicks_session_id', table_name='affiliate_clicks')
    op.drop_index('ix_affiliate_clicks_timestamp', table_name='affiliate_clicks')
    op.drop_index('ix_affiliate_clicks_partner_id', table_name='affiliate_clicks')
    op.drop_index('ix_affiliate_clicks_ref_code', table_name='affiliate_clicks')
    op.drop_index('ix_affiliate_clicks_monetizable_id', table_name='affiliate_clicks')
    op.drop_index('ix_affiliate_clicks_monetizable_type', table_name='affiliate_clicks')
    op.drop_index('idx_affiliate_session', table_name='affiliate_clicks')
    op.drop_index('idx_affiliate_ref', table_name='affiliate_clicks')
    op.drop_index('idx_affiliate_partner', table_name='affiliate_clicks')
    op.drop_index('idx_affiliate_entity', table_name='affiliate_clicks')
    op.drop_table('affiliate_clicks')
    
    # Drop monetization_configs table and its indexes
    op.drop_index('ix_monetization_configs_partner_id', table_name='monetization_configs')
    op.drop_index('ix_monetization_configs_ref_code', table_name='monetization_configs')
    op.drop_index('ix_monetization_configs_monetizable_id', table_name='monetization_configs')
    op.drop_index('ix_monetization_configs_monetizable_type', table_name='monetization_configs')
    op.drop_index('idx_mode_active', table_name='monetization_configs')
    op.drop_index('idx_partner_active', table_name='monetization_configs')
    op.drop_index('idx_monetizable_entity', table_name='monetization_configs')
    op.drop_table('monetization_configs')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS conversiontype")
    op.execute("DROP TYPE IF EXISTS monetizationmode")