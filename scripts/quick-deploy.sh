#!/bin/bash

# Quick Deploy Script - Run this after connecting to EC2

echo "🚀 Deploying Support Website"
echo "============================"
echo ""

# Update system
echo "📦 Updating system..."
sudo yum update -y -q

# Install Node.js 18
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - > /dev/null 2>&1
    sudo yum install -y nodejs > /dev/null 2>&1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install Git
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
cd ~
if [ -d "support-website" ]; then
    echo "📂 Updating repository..."
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

# Create .env.local template
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << 'ENVFILE'
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="change-this-to-a-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://100.25.216.241:3000"
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
VAPI_API_KEY=""
ENCRYPTION_KEY="change-this-to-a-32-character-key"
ENVFILE
    echo "⚠️  Please edit .env.local with your actual values!"
fi

# Stop existing process
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true

# Start with PM2
echo "🚀 Starting application..."
pm2 start npm --name "support-website" -- start
pm2 save

# Setup startup
pm2 startup | grep -v "PM2" | bash 2>/dev/null || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your website: http://100.25.216.241:3000"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.local: nano .env.local"
echo "   2. Restart: pm2 restart support-website"
echo "   3. View logs: pm2 logs support-website"

