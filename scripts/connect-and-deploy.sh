#!/bin/bash

# Connect to EC2 and Deploy Support Website

INSTANCE_ID="i-09fb878a140c50cbe"
PUBLIC_IP="100.25.216.241"
KEY_NAME="vocco-talk"

echo "🚀 Connecting to EC2 and Deploying Support Website"
echo "=================================================="
echo ""
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo ""

# Check for SSH key in multiple locations
KEY_FILE="$HOME/.ssh/${KEY_NAME}.pem"
if [ ! -f "$KEY_FILE" ]; then
    KEY_FILE="$HOME/Downloads/${KEY_NAME}.pem"
fi

if [ -f "$KEY_FILE" ]; then
    echo "✅ Found SSH key: $KEY_FILE"
    chmod 400 "$KEY_FILE"
    USE_SSH=true
else
    echo "⚠️  SSH key not found. Using AWS Systems Manager..."
    USE_SSH=false
fi

# Create deployment commands
DEPLOY_COMMANDS=$(cat << 'DEPLOY_END'
# Update system
echo "📦 Updating system..."
sudo yum update -y 2>/dev/null || sudo apt-get update -y 2>/dev/null

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs 2>/dev/null || sudo apt-get install -y nodejs 2>/dev/null
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo yum install -y git 2>/dev/null || sudo apt-get install -y git 2>/dev/null
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
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
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << 'ENVFILE'
# Database - UPDATE THIS!
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth - UPDATE THIS!
NEXTAUTH_SECRET="change-this-to-a-random-secret-key"
NEXTAUTH_URL="http://100.25.216.241:3000"

# Stripe - UPDATE IF USING!
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Vapi - UPDATE IF USING!
VAPI_API_KEY=""

# Encryption - UPDATE THIS!
ENCRYPTION_KEY="change-this-to-a-32-character-key"
ENVFILE
    echo "⚠️  IMPORTANT: Edit .env.local with your actual values!"
fi

# Stop existing PM2 process
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true

# Start with PM2
echo "🚀 Starting application..."
pm2 start npm --name "support-website" -- start
pm2 save

# Setup PM2 startup
pm2 startup | grep -v "PM2" | bash 2>/dev/null || echo "Run 'pm2 startup' manually"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your website is running at:"
echo "   http://100.25.216.241:3000"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs support-website  - View logs"
echo "   pm2 restart support-website - Restart app"
echo "   pm2 status - Check status"
DEPLOY_END
)

if [ "$USE_SSH" = true ]; then
    echo "🔗 Connecting via SSH..."
    echo ""
    ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@$PUBLIC_IP << EOF
$DEPLOY_COMMANDS
EOF
else
    echo "🔗 Connecting via AWS Systems Manager..."
    echo ""
    echo "Please run these commands after connecting:"
    echo ""
    echo "$DEPLOY_COMMANDS"
    echo ""
    echo "Connecting now..."
    aws ssm start-session --target $INSTANCE_ID
fi

