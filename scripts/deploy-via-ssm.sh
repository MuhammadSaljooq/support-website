#!/bin/bash

# Deploy via AWS Systems Manager (no SSH needed)

INSTANCE_ID="i-09fb878a140c50cbe"

echo "🚀 Deploying via AWS Systems Manager"
echo "===================================="
echo ""

# Create deployment script
cat > /tmp/deploy-commands.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
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

# Send commands via SSM
echo "📤 Sending deployment commands to EC2..."
aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=$(cat /tmp/deploy-commands.sh | base64)" \
  --output text \
  --query "Command.CommandId" > /tmp/command-id.txt

COMMAND_ID=$(cat /tmp/command-id.txt)
echo "✅ Command sent! Command ID: $COMMAND_ID"
echo ""
echo "⏳ Waiting for command to complete..."
sleep 5

# Wait for command to complete
aws ssm wait command-executed \
  --instance-id "$INSTANCE_ID" \
  --command-id "$COMMAND_ID" \
  --max-attempts 60 \
  --delay 5

# Get command output
echo ""
echo "📊 Command Output:"
aws ssm get-command-invocation \
  --instance-id "$INSTANCE_ID" \
  --command-id "$COMMAND_ID" \
  --query "StandardOutputContent" \
  --output text

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔗 To connect and manage:"
echo "   aws ssm start-session --target $INSTANCE_ID"
echo ""
echo "📊 To check status:"
echo "   aws ssm send-command --instance-ids $INSTANCE_ID --document-name 'AWS-RunShellScript' --parameters 'commands=[\"pm2 status\"]'"

