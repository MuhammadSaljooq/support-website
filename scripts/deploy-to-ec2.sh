#!/bin/bash

# Deploy Support Website to EC2 Instance

INSTANCE_ID="i-09fb878a140c50cbe"

echo "🚀 Deploying Support Website to EC2"
echo "===================================="
echo ""

# Check instance status
echo "📊 Checking instance status..."
STATE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].State.Name' --output text 2>/dev/null)

if [ -z "$STATE" ]; then
    echo "❌ Instance not found or access denied"
    exit 1
fi

echo "Instance ID: $INSTANCE_ID"
echo "Status: $STATE"
echo ""

# Start instance if stopped
if [ "$STATE" = "stopped" ]; then
    echo "⚠️  Instance is stopped. Starting..."
    aws ec2 start-instances --instance-ids $INSTANCE_ID
    echo "⏳ Waiting for instance to start..."
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    echo "✅ Instance is running!"
    sleep 10  # Wait for IP assignment
fi

# Get connection details
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
KEY_NAME=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].KeyName' --output text)

echo "Public IP: $PUBLIC_IP"
echo "Key Pair: $KEY_NAME"
echo ""

# Check for SSH key
KEY_FILE="$HOME/.ssh/${KEY_NAME}.pem"
if [ ! -f "$KEY_FILE" ]; then
    echo "⚠️  SSH key not found: $KEY_FILE"
    echo ""
    echo "Using AWS Systems Manager instead..."
    echo "Connecting via SSM..."
    aws ssm start-session --target $INSTANCE_ID
    exit 0
fi

# Set key permissions
chmod 400 "$KEY_FILE"

echo "🔗 Connecting to EC2 instance..."
echo ""

# Create deployment script
cat > /tmp/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

echo "📦 Setting up Support Website on EC2..."
echo ""

# Update system
echo "1️⃣  Updating system packages..."
sudo yum update -y || sudo apt-get update -y

# Install Node.js 18+ if not installed
if ! command -v node &> /dev/null; then
    echo "2️⃣  Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs || sudo apt-get install -y nodejs
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "3️⃣  Installing Git..."
    sudo yum install -y git || sudo apt-get install -y git
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "4️⃣  Installing PM2..."
    sudo npm install -g pm2
fi

# Clone or update repository
echo "5️⃣  Setting up application..."
if [ -d "support-website" ]; then
    echo "   Updating existing repository..."
    cd support-website
    git pull
else
    echo "   Cloning repository..."
    git clone https://github.com/MuhammadSaljooq/support-website.git
    cd support-website
fi

# Install dependencies
echo "6️⃣  Installing dependencies..."
npm install

# Build application
echo "7️⃣  Building application..."
npm run build

# Create .env.local file
if [ ! -f ".env.local" ]; then
    echo "8️⃣  Creating .env.local file..."
    cat > .env.local << 'ENVFILE'
# Database
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://YOUR_EC2_IP:3000"

# Stripe
STRIPE_SECRET_KEY="your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"

# Vapi
VAPI_API_KEY="your_vapi_api_key"

# Encryption
ENCRYPTION_KEY="your_32_character_encryption_key"
ENVFILE
    echo "   ⚠️  Please edit .env.local with your actual values!"
fi

# Start with PM2
echo "9️⃣  Starting application with PM2..."
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true
pm2 start npm --name "support-website" -- start
pm2 save
pm2 startup

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Your website should be running at:"
echo "   http://$(curl -s ifconfig.me):3000"
echo ""
echo "📝 Useful commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart support-website - Restart app"
echo "   pm2 stop support-website    - Stop app"
DEPLOY_SCRIPT

# Copy deployment script to EC2
echo "📤 Uploading deployment script..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no /tmp/deploy.sh ec2-user@$PUBLIC_IP:/tmp/deploy.sh 2>/dev/null || \
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no /tmp/deploy.sh ubuntu@$PUBLIC_IP:/tmp/deploy.sh

# Connect and run deployment
echo "🚀 Connecting and deploying..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@$PUBLIC_IP "chmod +x /tmp/deploy.sh && /tmp/deploy.sh" 2>/dev/null || \
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"

echo ""
echo "✅ Deployment process initiated!"
echo ""
echo "🔗 Connect to your instance:"
echo "   ssh -i $KEY_FILE ec2-user@$PUBLIC_IP"
echo ""
echo "📊 Check application status:"
echo "   ssh -i $KEY_FILE ec2-user@$PUBLIC_IP 'pm2 status'"

