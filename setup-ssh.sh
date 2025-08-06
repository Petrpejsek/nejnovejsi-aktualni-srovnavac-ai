#!/bin/bash

# =============================================================================
# 🔑 SSH Setup Helper for Hetzner Deployment
# =============================================================================

echo "🔑 Setting up SSH for Hetzner deployment..."

# Get server IP from user
read -p "Enter your Hetzner server IP: " HETZNER_IP
read -p "Enter SSH username (default: root): " HETZNER_USER
HETZNER_USER=${HETZNER_USER:-root}

# Check if SSH key exists
SSH_KEY="$HOME/.ssh/id_rsa"
if [ ! -f "$SSH_KEY" ]; then
    echo "🔧 Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY" -N ""
    echo "✅ SSH key generated at $SSH_KEY"
fi

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$HETZNER_USER@$HETZNER_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ SSH connection works!"
    
    # Save configuration
    echo "💾 Saving configuration..."
    export HETZNER_IP="$HETZNER_IP"
    export HETZNER_USER="$HETZNER_USER"
    
    # Create .env file for deployment
    cat > .env.deployment << EOF
HETZNER_IP=$HETZNER_IP
HETZNER_USER=$HETZNER_USER
SSH_KEY=$SSH_KEY
APP_DOMAIN=comparee.ai
EOF

    echo "✅ Configuration saved to .env.deployment"
    echo ""
    echo "🚀 Ready for deployment! Run:"
    echo "  source .env.deployment && ./deploy-production.sh"
    
else
    echo "❌ SSH connection failed!"
    echo ""
    echo "Manual setup required:"
    echo "1. Copy your SSH public key to server:"
    echo "   cat $SSH_KEY.pub"
    echo ""
    echo "2. Add it to server's authorized_keys:"
    echo "   ssh $HETZNER_USER@$HETZNER_IP"
    echo "   mkdir -p ~/.ssh"
    echo "   echo 'YOUR_PUBLIC_KEY' >> ~/.ssh/authorized_keys"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "3. Try connection again:"
    echo "   ssh $HETZNER_USER@$HETZNER_IP"
fi