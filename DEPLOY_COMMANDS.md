# 🚀 Deploy Commands for EC2

## Connect to Your EC2 Instance

**Option 1: AWS Systems Manager (Recommended - No SSH Key Needed)**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

**Option 2: SSH (If port 22 is open)**
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@100.25.216.241
```

---

## Once Connected, Run These Commands:

### Step 1: Update System and Install Prerequisites

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version

# Install Git
sudo yum install -y git

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website
```

### Step 3: Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

### Step 4: Configure Environment Variables

```bash
# Create .env.local file
nano .env.local
```

**Add these variables (update with your actual values):**

```bash
# Database - UPDATE THIS!
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# NextAuth - UPDATE THIS!
NEXTAUTH_SECRET="change-this-to-a-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://100.25.216.241:3000"

# Stripe (optional - leave empty if not using)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Vapi (optional - leave empty if not using)
VAPI_API_KEY=""

# Encryption - UPDATE THIS!
ENCRYPTION_KEY="change-this-to-a-32-character-key"
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Start Application with PM2

```bash
# Start the application
pm2 start npm --name "support-website" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs (usually starts with "sudo env PATH=...")
```

### Step 6: Verify It's Running

```bash
# Check status
pm2 status

# View logs
pm2 logs support-website

# View real-time logs (press Ctrl+C to exit)
pm2 logs support-website --lines 50
```

---

## Access Your Website

Your website should now be accessible at:
```
http://100.25.216.241:3000
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

# Monitor resources
pm2 monit

# View all PM2 processes
pm2 list
```

---

## Troubleshooting

### Application not starting
- Check logs: `pm2 logs support-website`
- Verify `.env.local` is configured correctly
- Check database connection

### Port 3000 not accessible
- Verify security group allows port 3000 (already configured ✅)
- Check if app is running: `pm2 status`
- Check logs for errors: `pm2 logs support-website`

### Need to update code
```bash
cd support-website
git pull
npm install
npm run build
pm2 restart support-website
```

---

## Quick Reference

**Connect:**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

**One-line deploy (after connecting):**
```bash
sudo yum update -y && curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs git && sudo npm install -g pm2 && git clone https://github.com/MuhammadSaljooq/support-website.git && cd support-website && npm install && npm run build && pm2 start npm --name "support-website" -- start && pm2 save
```

---

**Your EC2 Instance:**
- **Instance ID**: `i-09fb878a140c50cbe`
- **Public IP**: `100.25.216.241`
- **Status**: ✅ Running
- **Port 3000**: ✅ Open in security group

