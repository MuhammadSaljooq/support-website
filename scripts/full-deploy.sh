#!/bin/bash
# Complete deployment script for vocco-talk EC2 instance

set -e

echo "🚀 Complete Website Deployment"
echo "=============================="
echo ""

# Update system
echo "📦 Step 1: Updating system packages..."
sudo yum update -y -q

# Install Node.js 18
echo "📦 Step 2: Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - > /dev/null 2>&1
    sudo yum install -y nodejs > /dev/null 2>&1
fi
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install Git
echo "📦 Step 3: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo yum install -y git > /dev/null 2>&1
fi

# Install PM2
echo "📦 Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
fi

# Install PostgreSQL client (for database connections)
echo "📦 Step 5: Installing PostgreSQL client..."
sudo yum install -y postgresql15 > /dev/null 2>&1 || sudo yum install -y postgresql > /dev/null 2>&1 || echo "PostgreSQL client installation skipped"

# Setup application
echo "📦 Step 6: Setting up application..."
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

# Install dependencies
echo "📦 Step 7: Installing dependencies (this may take a few minutes)..."
npm install

# Build application
echo "🔨 Step 8: Building application..."
npm run build

# Get public IP for NEXTAUTH_URL
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")

# Create .env.local with all required variables
echo "📝 Step 9: Creating .env.local file..."
cat > .env.local << ENVFILE
# Database - UPDATE WITH YOUR DATABASE URL
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://${PUBLIC_IP}:3000"

# Stripe Configuration (optional - leave empty if not using)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Vapi Configuration (optional - leave empty if not using)
VAPI_API_KEY=""

# Encryption Key
ENCRYPTION_KEY="$(openssl rand -hex 16)"
ENVFILE

echo "✅ .env.local created with auto-generated secrets"
echo "⚠️  IMPORTANT: Update DATABASE_URL in .env.local with your actual database connection string!"

# Stop existing PM2 process
echo "🔄 Step 10: Managing PM2 processes..."
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true

# Start with PM2
echo "🚀 Step 11: Starting application..."
pm2 start npm --name "support-website" -- start
pm2 save

# Setup PM2 startup
echo "⚙️  Step 12: Configuring PM2 startup..."
pm2 startup | grep -v "PM2" | bash 2>/dev/null || echo "Run 'pm2 startup' manually if needed"

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
echo "   3. Add other API keys if needed (Stripe, Vapi)"
echo "   4. Restart: pm2 restart support-website"
echo "   5. View logs: pm2 logs support-website"
echo ""
echo "🔍 Useful Commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs support-website - View logs"
echo "   pm2 restart support-website - Restart application"
echo "   pm2 stop support-website - Stop application"

