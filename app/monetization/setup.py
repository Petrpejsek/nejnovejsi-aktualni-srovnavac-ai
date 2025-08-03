#!/usr/bin/env python3
"""
Monetization System Setup Script

Interactive setup script for the portable monetization system.
Handles configuration, database setup, and integration verification.
"""

import os
import sys
import subprocess
import json
from typing import Dict, Any, List
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class MonetizationSetup:
    """Setup manager for the monetization system"""
    
    def __init__(self):
        self.project_root = Path.cwd()
        self.monetization_dir = self.project_root / "app" / "monetization"
        self.env_file = self.project_root / ".env"
        
    def print_header(self, text: str):
        """Print colored header"""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    
    def print_success(self, text: str):
        """Print success message"""
        print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")
    
    def print_warning(self, text: str):
        """Print warning message"""
        print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")
    
    def print_error(self, text: str):
        """Print error message"""
        print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")
    
    def print_info(self, text: str):
        """Print info message"""
        print(f"{Colors.OKBLUE}ℹ️  {text}{Colors.ENDC}")
    
    def check_prerequisites(self) -> bool:
        """Check system prerequisites"""
        self.print_header("CHECKING PREREQUISITES")
        
        checks_passed = True
        
        # Check Python version
        if sys.version_info < (3, 8):
            self.print_error("Python 3.8+ is required")
            checks_passed = False
        else:
            self.print_success(f"Python {sys.version.split()[0]} is installed")
        
        # Check if we're in the right directory
        if not self.monetization_dir.exists():
            self.print_error("Monetization directory not found. Are you in the project root?")
            checks_passed = False
        else:
            self.print_success("Monetization directory found")
        
        # Check required files
        required_files = [
            "models.py", "schema.py", "routes.py", "services.py", 
            "utils.py", "config.py", "__init__.py"
        ]
        
        for file in required_files:
            if not (self.monetization_dir / file).exists():
                self.print_error(f"Required file missing: {file}")
                checks_passed = False
            else:
                self.print_success(f"Found: {file}")
        
        return checks_passed
    
    def check_environment_variables(self) -> Dict[str, bool]:
        """Check environment variables"""
        self.print_header("CHECKING ENVIRONMENT VARIABLES")
        
        required_vars = {
            "STRIPE_SECRET_KEY": False,
            "STRIPE_WEBHOOK_SECRET": False,
            "DATABASE_URL": False
        }
        
        optional_vars = {
            "STRIPE_PUBLISHABLE_KEY": False,
            "MAXMIND_LICENSE_KEY": False,
            "FRAUD_DETECTION_ENABLED": False,
            "ANALYTICS_ENABLED": False
        }
        
        # Load .env file if exists
        if self.env_file.exists():
            with open(self.env_file) as f:
                for line in f:
                    if '=' in line and not line.strip().startswith('#'):
                        key, value = line.strip().split('=', 1)
                        if key in required_vars:
                            required_vars[key] = bool(value.strip())
                        if key in optional_vars:
                            optional_vars[key] = bool(value.strip())
        
        # Check environment
        for var in required_vars:
            if os.getenv(var):
                required_vars[var] = True
        
        for var in optional_vars:
            if os.getenv(var):
                optional_vars[var] = True
        
        # Report status
        print("Required variables:")
        for var, is_set in required_vars.items():
            if is_set:
                self.print_success(f"{var} is configured")
            else:
                self.print_error(f"{var} is missing")
        
        print("\nOptional variables:")
        for var, is_set in optional_vars.items():
            if is_set:
                self.print_success(f"{var} is configured")
            else:
                self.print_info(f"{var} is not set (optional)")
        
        return required_vars
    
    def setup_environment_variables(self):
        """Interactive setup of environment variables"""
        self.print_header("ENVIRONMENT VARIABLE SETUP")
        
        env_vars = {}
        
        # Required variables
        self.print_info("Setting up required environment variables...")
        
        stripe_secret = input("Enter your Stripe Secret Key (sk_test_... or sk_live_...): ").strip()
        if stripe_secret:
            env_vars["STRIPE_SECRET_KEY"] = stripe_secret
        
        stripe_webhook = input("Enter your Stripe Webhook Secret (whsec_...): ").strip()
        if stripe_webhook:
            env_vars["STRIPE_WEBHOOK_SECRET"] = stripe_webhook
        
        database_url = input("Enter your Database URL (postgresql://...): ").strip()
        if database_url:
            env_vars["DATABASE_URL"] = database_url
        
        # Optional variables
        print("\nOptional variables (press Enter to skip):")
        
        stripe_pub = input("Stripe Publishable Key (pk_test_... or pk_live_...): ").strip()
        if stripe_pub:
            env_vars["STRIPE_PUBLISHABLE_KEY"] = stripe_pub
        
        maxmind_key = input("MaxMind License Key (for fraud detection): ").strip()
        if maxmind_key:
            env_vars["MAXMIND_LICENSE_KEY"] = maxmind_key
        
        fraud_detection = input("Enable fraud detection? (y/n): ").strip().lower()
        if fraud_detection in ['y', 'yes']:
            env_vars["FRAUD_DETECTION_ENABLED"] = "true"
        
        # Save to .env file
        if env_vars:
            self.save_env_vars(env_vars)
    
    def save_env_vars(self, vars_dict: Dict[str, str]):
        """Save environment variables to .env file"""
        existing_vars = {}
        
        # Load existing .env
        if self.env_file.exists():
            with open(self.env_file) as f:
                for line in f:
                    if '=' in line and not line.strip().startswith('#'):
                        key, value = line.strip().split('=', 1)
                        existing_vars[key] = value
        
        # Merge with new variables
        existing_vars.update(vars_dict)
        
        # Write back to .env
        with open(self.env_file, 'w') as f:
            f.write("# Monetization System Configuration\n")
            f.write("# Auto-generated by setup script\n\n")
            
            for key, value in existing_vars.items():
                f.write(f"{key}={value}\n")
        
        self.print_success(f"Environment variables saved to {self.env_file}")
    
    def setup_database(self):
        """Setup database migrations"""
        self.print_header("DATABASE SETUP")
        
        # Check if Alembic is available
        try:
            subprocess.run(["alembic", "--version"], capture_output=True, check=True)
            self.print_success("Alembic is available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.print_error("Alembic not found. Install with: pip install alembic")
            return False
        
        # Check if alembic.ini exists
        alembic_ini = self.project_root / "alembic.ini"
        if not alembic_ini.exists():
            self.print_warning("alembic.ini not found. Run: alembic init alembic")
            return False
        
        # Generate migration
        try:
            self.print_info("Generating database migration...")
            subprocess.run([
                "alembic", "revision", "--autogenerate", 
                "-m", "Add monetization tables"
            ], check=True)
            self.print_success("Migration generated successfully")
            
            # Ask if user wants to apply migration
            apply = input("Apply migration now? (y/n): ").strip().lower()
            if apply in ['y', 'yes']:
                subprocess.run(["alembic", "upgrade", "head"], check=True)
                self.print_success("Migration applied successfully")
            
        except subprocess.CalledProcessError as e:
            self.print_error(f"Migration failed: {e}")
            return False
        
        return True
    
    def setup_stripe_webhooks(self):
        """Setup Stripe webhook configuration"""
        self.print_header("STRIPE WEBHOOK SETUP")
        
        self.print_info("Configure your Stripe webhook with these settings:")
        print(f"  Webhook URL: https://your-domain.com/monetization/stripe/webhook")
        print(f"  Events to send:")
        print(f"    • checkout.session.completed")
        print(f"    • invoice.payment_succeeded")
        print(f"    • invoice.payment_failed")
        
        webhook_secret = input("\nEnter your webhook secret (whsec_...): ").strip()
        if webhook_secret:
            # Update .env file
            self.save_env_vars({"STRIPE_WEBHOOK_SECRET": webhook_secret})
            self.print_success("Webhook secret saved")
    
    def verify_installation(self):
        """Verify the installation"""
        self.print_header("INSTALLATION VERIFICATION")
        
        try:
            # Try importing the monetization module
            sys.path.insert(0, str(self.project_root))
            from app.monetization import MonetizationService
            from app.monetization.config import get_config, validate_config
            
            self.print_success("Monetization module imports successfully")
            
            # Validate configuration
            config = get_config()
            issues = validate_config()
            
            if issues:
                self.print_warning("Configuration issues found:")
                for issue in issues:
                    print(f"  • {issue}")
            else:
                self.print_success("Configuration is valid")
            
            # Test database connection (if possible)
            try:
                from app.monetization.models import MonetizationConfig
                self.print_success("Database models are accessible")
            except Exception as e:
                self.print_warning(f"Database connection issue: {e}")
            
        except ImportError as e:
            self.print_error(f"Import error: {e}")
            return False
        
        return True
    
    def generate_integration_examples(self):
        """Generate integration examples"""
        self.print_header("GENERATING INTEGRATION EXAMPLES")
        
        examples_dir = self.monetization_dir / "examples"
        examples_dir.mkdir(exist_ok=True)
        
        # FastAPI integration example
        fastapi_example = """
# app/main.py - FastAPI Integration Example

from fastapi import FastAPI
from app.monetization.routes import router as monetization_router

app = FastAPI(title="Your App with Monetization")

# Include monetization routes
app.include_router(monetization_router)

@app.get("/")
async def root():
    return {"message": "App with monetization system"}

# Example usage in your endpoints
@app.get("/tools/{tool_id}")
async def get_tool(tool_id: str):
    # Your existing tool logic
    tool = get_tool_from_db(tool_id)
    
    # Add monetization URL
    if tool:
        tool["monetized_url"] = f"/monetization/out/Tool/{tool_id}?ref={tool['ref_code']}"
    
    return tool
"""
        
        # Frontend integration example
        frontend_example = """
// Frontend Integration Example

// React Component
function ToolCard({ tool }) {
  const handleVisit = () => {
    // Use monetization redirect instead of direct link
    window.open(`/monetization/out/Tool/${tool.id}?ref=${tool.refCode}`, '_blank');
  };

  return (
    <div className="tool-card">
      <h3>{tool.name}</h3>
      <button onClick={handleVisit}>Visit Tool</button>
    </div>
  );
}

// JavaScript tracking
function trackConversion(refCode, type, value) {
  // Pixel tracking
  const img = new Image();
  img.src = `/monetization/track/conversion.gif?ref=${refCode}&type=${type}&value=${value}`;
  
  // Or webhook tracking
  fetch('/monetization/api/affiliate/conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ref_code: refCode,
      conversion_type: type,
      conversion_value: value
    })
  });
}
"""
        
        # Save examples
        (examples_dir / "fastapi_integration.py").write_text(fastapi_example)
        (examples_dir / "frontend_integration.js").write_text(frontend_example)
        
        self.print_success(f"Integration examples generated in {examples_dir}")
    
    def run_full_setup(self):
        """Run the complete setup process"""
        self.print_header("🚀 MONETIZATION SYSTEM SETUP")
        
        print(f"{Colors.OKBLUE}Welcome to the Monetization System Setup!{Colors.ENDC}")
        print(f"{Colors.OKBLUE}This script will help you configure and integrate the system.{Colors.ENDC}")
        
        # Step 1: Prerequisites
        if not self.check_prerequisites():
            self.print_error("Prerequisites check failed. Please fix the issues and run again.")
            return False
        
        # Step 2: Environment variables
        env_status = self.check_environment_variables()
        if not all(env_status.values()):
            setup_env = input("\nSome environment variables are missing. Set them up now? (y/n): ").strip().lower()
            if setup_env in ['y', 'yes']:
                self.setup_environment_variables()
        
        # Step 3: Database setup
        setup_db = input("\nSet up database migrations? (y/n): ").strip().lower()
        if setup_db in ['y', 'yes']:
            self.setup_database()
        
        # Step 4: Stripe webhooks
        setup_stripe = input("\nConfigure Stripe webhooks? (y/n): ").strip().lower()
        if setup_stripe in ['y', 'yes']:
            self.setup_stripe_webhooks()
        
        # Step 5: Verification
        self.verify_installation()
        
        # Step 6: Generate examples
        gen_examples = input("\nGenerate integration examples? (y/n): ").strip().lower()
        if gen_examples in ['y', 'yes']:
            self.generate_integration_examples()
        
        # Final message
        self.print_header("🎉 SETUP COMPLETE!")
        print(f"{Colors.OKGREEN}The monetization system has been set up successfully!{Colors.ENDC}")
        print(f"\n{Colors.OKBLUE}Next steps:{Colors.ENDC}")
        print(f"1. Review the configuration in .env")
        print(f"2. Apply database migrations if not done: alembic upgrade head")
        print(f"3. Configure Stripe webhooks in your Stripe dashboard")
        print(f"4. Update your frontend to use monetization redirects")
        print(f"5. Test the system with test data")
        print(f"\n{Colors.OKBLUE}Documentation:{Colors.ENDC}")
        print(f"• README: app/monetization/README.md")
        print(f"• Examples: app/monetization/examples/")
        print(f"• API docs: /docs (when FastAPI app is running)")
        
        return True


def main():
    """Main setup function"""
    setup = MonetizationSetup()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "check":
            setup.check_prerequisites()
            setup.check_environment_variables()
        elif command == "env":
            setup.setup_environment_variables()
        elif command == "db":
            setup.setup_database()
        elif command == "verify":
            setup.verify_installation()
        elif command == "examples":
            setup.generate_integration_examples()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: check, env, db, verify, examples")
    else:
        # Run full interactive setup
        setup.run_full_setup()


if __name__ == "__main__":
    main()