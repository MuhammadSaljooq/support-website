#!/bin/bash
# Step-by-step deployment script (handles errors better)

set -e

echo "🚀 Step-by-Step Deployment"
echo "=========================="
echo ""

# Step 1: Try to update (skip if fails)
echo "📦 Step 1: Updating system (may skip if fails)..."
sudo yum update -y || echo "⚠️  Update skipped (non-critical)"

# Step 2: Install Node.js
echo ""
echo "📦 Step 2: Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Step 3: Install Git
echo ""
echo "📦 Step 3: Installing Git..."
sudo yum install -y git

# Step 4: Install PM2
echo ""
echo "📦 Step 4: Installing PM2..."
sudo npm install -g pm2

# Step 5: Clone repository
echo ""
echo "📦 Step 5: Setting up repository..."
cd ~
if [ -d "support-website" ]; then
    echo "📂 Repository exists, updating..."
    cd support-website
    git pull
else
    echo "📂 Cloning repository..."
    git clone https://github.com/MuhammadSaljooq/support-website.git
    cd support-website
fi

# Step 6: Install dependencies
echo ""
echo "📦 Step 6: Installing dependencies (this may take a few minutes)..."
npm install

# Step 7: Build application
echo ""
echo "🔨 Step 7: Building application..."
npm run build

# Step 8: Create .env.local
echo ""
echo "📝 Step 8: Creating .env.local..."
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
cat > .env.local << EOF
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://${PUBLIC_IP}:3000"
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
VAPI_API_KEY=""
ENCRYPTION_KEY="$(openssl rand -hex 16)"
EOF

echo "✅ .env.local created"
echo "⚠️  Remember to update DATABASE_URL!"

# Step 9: Start with PM2
echo ""
echo "🚀 Step 9: Starting application..."
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true
pm2 start npm --name "support-website" -- start
pm2 save

# Step 10: Setup startup
echo ""
echo "⚙️  Step 10: Configuring PM2 startup..."
pm2 startup | grep -v "PM2" | bash 2>/dev/null || echo "Run 'pm2 startup' manually if needed"

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your website: http://${PUBLIC_IP}:3000"
echo ""
echo "📝 Next: Update .env.local with your database URL"
echo "   nano .env.local"
echo "   pm2 restart support-website"

