#!/bin/bash

# Deploy All Changes to EC2
# This script will:
# 1. Commit all changes
# 2. Push to GitHub
# 3. Deploy to EC2

set -e

INSTANCE_ID="i-097e41b2265c4b372"  # Updated with actual instance ID
REPO_URL="https://github.com/MuhammadSaljooq/support-website.git"

echo "🚀 Deploying All Changes to EC2"
echo "================================"
echo ""

# Step 1: Check git status
echo "📊 Step 1: Checking git status..."
if ! git status &>/dev/null; then
    echo "❌ Not a git repository or git not initialized"
    exit 1
fi

# Step 2: Add all changes
echo "📦 Step 2: Staging all changes..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit. Repository is up to date."
else
    echo "💾 Step 3: Committing changes..."
    git commit -m "Deploy: Update MongoDB configuration and login logging $(date +%Y-%m-%d)" || {
        echo "⚠️  Commit failed or no changes to commit"
    }
fi

# Step 3: Push to GitHub
echo "☁️  Step 4: Pushing to GitHub..."
if git push origin main 2>&1; then
    echo "✅ Changes pushed to GitHub successfully!"
else
    echo "⚠️  Push failed. Continuing with deployment anyway..."
    echo "   (You may need to push manually: git push origin main)"
fi

echo ""
echo "🖥️  Step 5: Deploying to EC2..."
echo ""

# Get EC2 instance details
echo "📊 Checking EC2 instance status..."
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
    sleep 10
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
    echo "📋 Manual Deployment Instructions:"
    echo "   1. Connect via AWS Console: https://console.aws.amazon.com/ec2/"
    echo "   2. Select instance: $INSTANCE_ID"
    echo "   3. Click Connect → EC2 Instance Connect"
    echo "   4. Run this command:"
    echo ""
    echo "   cd ~/support-website && git pull && npm install && npm run build && pm2 restart support-website"
    echo ""
    exit 0
fi

# Set key permissions
chmod 400 "$KEY_FILE" 2>/dev/null || true

echo "🔗 Connecting to EC2 and deploying..."
echo ""

# Deploy script to run on EC2
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ec2-user@$PUBLIC_IP << 'DEPLOY_SCRIPT'
set -e

echo "📦 Starting deployment on EC2..."
echo ""

# Navigate to application directory
if [ -d "support-website" ]; then
    echo "📂 Updating repository..."
    cd support-website
    git pull origin main
else
    echo "📂 Cloning repository..."
    git clone https://github.com/MuhammadSaljooq/support-website.git
    cd support-website
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building application..."
npm run build

echo ""
echo "🔄 Restarting application..."
pm2 stop support-website 2>/dev/null || true
pm2 delete support-website 2>/dev/null || true
pm2 start npm --name "support-website" -- start
pm2 save

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Your website is running at:"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "   http://${PUBLIC_IP}:3000"
echo ""
DEPLOY_SCRIPT

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "🌐 Your website should be accessible at:"
echo "   http://${PUBLIC_IP}:3000"
echo ""
echo "📊 To check status, run:"
echo "   ssh -i $KEY_FILE ec2-user@$PUBLIC_IP 'pm2 status'"
echo ""

