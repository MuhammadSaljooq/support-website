# 🚀 Automatic Deployment Guide

Since automated deployment via SSM isn't available, here's the easiest way to deploy:

## Option 1: One-Line Deploy (Easiest)

**Connect to EC2 first:**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

**Then run this one command:**
```bash
sudo yum update -y && curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs git && sudo npm install -g pm2 && cd ~ && ([ -d support-website ] && (cd support-website && git pull) || git clone https://github.com/MuhammadSaljooq/support-website.git) && cd support-website && npm install && npm run build && pm2 stop support-website 2>/dev/null || true && pm2 delete support-website 2>/dev/null || true && pm2 start npm --name support-website -- start && pm2 save && pm2 status
```

## Option 2: Use Deployment Script

**Step 1: Connect to EC2**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

**Step 2: Download and run the script**
```bash
curl -fsSL https://raw.githubusercontent.com/MuhammadSaljooq/support-website/main/scripts/quick-deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

## Option 3: Manual Step-by-Step

**Connect:**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

**Then run each command:**

```bash
# 1. Update system
sudo yum update -y

# 2. Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repository
cd ~
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website

# 5. Install dependencies
npm install

# 6. Build
npm run build

# 7. Create .env.local (edit with your values)
nano .env.local

# 8. Start with PM2
pm2 start npm --name "support-website" -- start
pm2 save
pm2 startup
# Run the command it outputs

# 9. Check status
pm2 status
pm2 logs support-website
```

## Configure Environment Variables

After deployment, edit `.env.local`:

```bash
nano .env.local
```

**Required variables:**
```bash
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://100.25.216.241:3000"
ENCRYPTION_KEY="your-32-character-key"
```

Then restart:
```bash
pm2 restart support-website
```

## Access Your Website

After deployment:
```
http://100.25.216.241:3000
```

## Useful Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs support-website

# Restart
pm2 restart support-website

# Stop
pm2 stop support-website

# Monitor
pm2 monit
```

---

**Your EC2 Instance:**
- Instance ID: `i-09fb878a140c50cbe`
- Public IP: `100.25.216.241`
- Port 3000: ✅ Open

