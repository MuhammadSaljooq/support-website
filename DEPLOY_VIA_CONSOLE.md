# 🚀 Deploy via AWS Console (Easiest Method)

Since SSM and SSH aren't working, use AWS Console EC2 Instance Connect - it works in your browser!

## Step-by-Step Instructions

### Step 1: Open AWS Console

1. Go to **https://console.aws.amazon.com/ec2/**
2. Sign in to your AWS account
3. Click **Instances** in the left sidebar
4. Find and select instance: **i-09fb878a140c50cbe** (or search for "100.25.216.241")

### Step 2: Connect via EC2 Instance Connect

1. Click **Connect** button (top right)
2. Select **EC2 Instance Connect** tab
3. Click **Connect** button
4. A browser terminal will open - you're now connected!

### Step 3: Run Deployment Commands

Copy and paste these commands **one at a time** in the browser terminal:

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

# 6. Build application
npm run build

# 7. Create .env.local (you'll edit this)
nano .env.local
```

**In nano editor, add:**
```bash
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="your-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://100.25.216.241:3000"
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
VAPI_API_KEY=""
ENCRYPTION_KEY="your-32-character-key"
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# 8. Start application
pm2 start npm --name "support-website" -- start
pm2 save

# 9. Setup auto-start
pm2 startup
# Copy and run the command it outputs (starts with "sudo env PATH=...")

# 10. Check status
pm2 status
pm2 logs support-website
```

## ✅ Done!

Your website is now running at:
```
http://100.25.216.241:3000
```

## Quick One-Liner (Alternative)

If you prefer, you can run this **single command** after connecting:

```bash
sudo yum update -y && curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs git && sudo npm install -g pm2 && cd ~ && ([ -d support-website ] && (cd support-website && git pull) || git clone https://github.com/MuhammadSaljooq/support-website.git) && cd support-website && npm install && npm run build && pm2 stop support-website 2>/dev/null || true && pm2 delete support-website 2>/dev/null || true && pm2 start npm --name support-website -- start && pm2 save && pm2 status
```

Then edit `.env.local`:
```bash
nano .env.local
pm2 restart support-website
```

## Troubleshooting

### Can't find Connect button?
- Make sure instance is selected (checkbox checked)
- Instance must be in "running" state

### Commands fail?
- Run commands one at a time
- Check for error messages
- Some commands take a few minutes (npm install, npm run build)

### Website not accessible?
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs support-website`
- Verify port 3000 is open (already configured ✅)

---

**This method works 100% - it uses AWS Console's built-in terminal!**

