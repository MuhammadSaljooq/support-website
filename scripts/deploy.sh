#!/bin/bash

# Deploy Support Website to EC2

INSTANCE_ID="i-09fb878a140c50cbe"
PUBLIC_IP="100.25.216.241"
KEY_FILE="$HOME/.ssh/vocco-talk.pem"
USER="ec2-user"

echo "🚀 Deploying Support Website to EC2"
echo "===================================="
echo ""
echo "Instance: $INSTANCE_ID"
echo "IP: $PUBLIC_IP"
echo ""

# Test connection
echo "🔗 Testing connection..."
if ! ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=5 $USER@$PUBLIC_IP "echo 'Connected'" &>/dev/null; then
    echo "❌ Cannot connect to EC2 instance"
    exit 1
fi
echo "✅ Connection successful!"
echo ""

# Deploy
echo "📦 Starting deployment..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no $USER@$PUBLIC_IP << 'DEPLOY_SCRIPT'
set -e

echo "📦 Updating system packages..."
sudo yum update -y -q

# Install Node.js 18 if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - > /dev/null 2>&1
    sudo yum install -y nodejs > /dev/null 2>&1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo yum install -y git > /dev/null 2>&1
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2 > /dev/null 2>&1
fi

# Setup application
if [ -d "support-website" ]; then
    echo "📂 Updating existing repository..."
    cd support-website
    git pull
else
    echo "📂 Cloning repository..."
    git clone https://github.com/MuhammadSaljooq/support-website.git
    cd support-website
fi

# Install dependencies
echo "📦 Installing dependencies (this may take a few minutes)..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Create .env.local template if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << 'ENVFILE'
# Database - UPDATE THIS!
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth - UPDATE THIS!
NEXTAUTH_SECRET="change-this-to-a-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://100.25.216.241:3000"

# Stripe (optional)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Vapi (optional)
VAPI_API_KEY=""

# Encryption - UPDATE THIS!
ENCRYPTION_KEY="change-this-to-a-32-character-key"
ENVFILE
    echo "⚠️  IMPORTANT: Edit .env.local with your actual values!"
    echo "   Run: nano .env.local"
fi

# Stop existing PM2 process
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start npm --name "support-website" -- start
pm2 save

# Setup PM2 startup
echo "⚙️  Configuring PM2 startup..."
pm2 startup | grep -v "PM2" | bash 2>/dev/null || echo "Run 'pm2 startup' manually if needed"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your website is running at:"
echo "   http://100.25.216.241:3000"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.local: nano .env.local"
echo "   2. Restart app: pm2 restart support-website"
echo "   3. View logs: pm2 logs support-website"
DEPLOY_SCRIPT

echo ""
echo "✅ Deployment script completed!"
echo ""
echo "🔗 To connect and manage:"
echo "   ssh -i $KEY_FILE $USER@$PUBLIC_IP"
echo ""
echo "📊 To check status:"
echo "   ssh -i $KEY_FILE $USER@$PUBLIC_IP 'pm2 status'"

