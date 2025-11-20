# 🚀 Deploy Support Website to EC2

## Your EC2 Instance

- **Instance ID**: `i-09fb878a140c50cbe`
- **Status**: Starting/Running
- **Public IP**: (Will be assigned when running)

---

## Quick Deploy (Automated)

Run this script to automatically deploy:

```bash
./scripts/deploy-to-ec2.sh
```

This will:
1. ✅ Start the instance if stopped
2. ✅ Connect via SSH
3. ✅ Install Node.js, Git, PM2
4. ✅ Clone your repository
5. ✅ Install dependencies
6. ✅ Build the application
7. ✅ Start with PM2

---

## Manual Deployment Steps

### Step 1: Connect to EC2

**Option A: Using SSH Key**
```bash
# Get public IP first
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids i-09fb878a140c50cbe --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

# Connect (replace KEY_NAME with your key)
ssh -i ~/.ssh/KEY_NAME.pem ec2-user@$PUBLIC_IP
```

**Option B: Using AWS Systems Manager (No Key Needed)**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

### Step 2: Install Prerequisites

Once connected to EC2, run:

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 3: Clone and Setup

```bash
# Clone your repository
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 4: Configure Environment

```bash
# Create .env.local file
nano .env.local
```

Add your environment variables:
```bash
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://YOUR_EC2_IP:3000"
# ... other variables
```

### Step 5: Start Application

```bash
# Start with PM2
pm2 start npm --name "support-website" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
```

### Step 6: Configure Security Group

Your EC2 security group must allow:
- **Port 3000** (for Next.js app)
- **Port 22** (for SSH)

1. Go to **EC2** → **Security Groups**
2. Select your instance's security group
3. **Inbound rules** → **Edit**
4. Add rules:
   - **Type**: Custom TCP
   - **Port**: 3000
   - **Source**: 0.0.0.0/0 (or your IP)
   - **Type**: SSH
   - **Port**: 22
   - **Source**: Your IP

---

## Access Your Website

After deployment, access at:
```
http://YOUR_PUBLIC_IP:3000
```

---

## Useful Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs support-website

# Restart application
pm2 restart support-website

# Stop application
pm2 stop support-website

# Monitor
pm2 monit
```

---

## Troubleshooting

### Port 3000 not accessible
- ✅ Check security group allows port 3000
- ✅ Verify application is running: `pm2 status`
- ✅ Check logs: `pm2 logs support-website`

### Application crashes
- ✅ Check logs: `pm2 logs support-website`
- ✅ Verify .env.local is configured
- ✅ Check database connection

### Can't connect via SSH
- ✅ Use Systems Manager: `aws ssm start-session --target i-09fb878a140c50cbe`
- ✅ Check security group allows SSH (port 22)
- ✅ Verify instance is running

---

## Next Steps After Deployment

1. ✅ Set up domain name (optional)
2. ✅ Configure SSL certificate (Let's Encrypt)
3. ✅ Set up auto-deployment (GitHub Actions)
4. ✅ Configure monitoring and alerts

