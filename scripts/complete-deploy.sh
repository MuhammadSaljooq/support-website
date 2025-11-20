#!/bin/bash
# Complete automated deployment script

set -e

echo "🚀 Complete Website Deployment"
echo "=============================="
echo ""

# Update system (skip if fails)
echo "📦 Step 1: Updating system..."
sudo yum update -y || echo "⚠️  Update skipped"

# Install Node.js 18
echo ""
echo "📦 Step 2: Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install Git
echo ""
echo "📦 Step 3: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo yum install -y git
fi

# Install PM2
echo ""
echo "📦 Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Setup application
echo ""
echo "📦 Step 5: Setting up application..."
cd ~
if [ -d "support-website" ]; then
    echo "📂 Updating existing repository..."
    cd support-website
    git pull
else
    echo "📂 Cloning repository..."
    git clone https://github.com/MuhammadSaljooq/support-website.git
    cd support-website
fi

# Clean up before install
echo ""
echo "🧹 Cleaning up..."
rm -rf node_modules .next
npm cache clean --force

# Install dependencies
echo ""
echo "📦 Step 6: Installing dependencies (this may take 5-10 minutes)..."
npm install

# Build application
echo ""
echo "🔨 Step 7: Building application (this may take a few minutes)..."
npm run build

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create .env.local
echo ""
echo "📝 Step 8: Creating .env.local..."
cat > .env.local << EOF
# Database - UPDATE THIS WITH YOUR DATABASE URL
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://${PUBLIC_IP}:3000"

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Vapi Configuration (optional)
VAPI_API_KEY=""

# Encryption Key
ENCRYPTION_KEY="$(openssl rand -hex 16)"
EOF

echo "✅ .env.local created"
echo "⚠️  IMPORTANT: Update DATABASE_URL in .env.local with your actual database connection!"

# Stop existing PM2 process
echo ""
echo "🔄 Step 9: Managing PM2 processes..."
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true

# Start with PM2
echo ""
echo "🚀 Step 10: Starting application..."
pm2 start npm --name "support-website" -- start
pm2 save

# Setup PM2 startup
echo ""
echo "⚙️  Step 11: Configuring PM2 startup..."
STARTUP_CMD=$(pm2 startup | grep -v "PM2" | tail -1)
if [ -n "$STARTUP_CMD" ]; then
    eval "$STARTUP_CMD" 2>/dev/null || echo "Run 'pm2 startup' manually if needed"
fi

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your website is running at:"
echo "   http://${PUBLIC_IP}:3000"
echo ""
echo "📝 Next Steps:"
echo "   1. Edit .env.local: nano .env.local"
echo "   2. Update DATABASE_URL with your actual database connection"
echo "   3. Add API keys if needed (Vapi, Stripe)"
echo "   4. Restart: pm2 restart support-website"
echo ""
echo "🔍 Useful Commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs support-website - View logs"
echo "   pm2 restart support-website - Restart application"
echo "   pm2 stop support-website - Stop application"

