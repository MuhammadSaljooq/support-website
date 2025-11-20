# 🚀 Deploy & Open Your Website

## Current Status
- ✅ EC2 Instance: Created and running
- ❌ Application: Not deployed yet
- ❌ Website: Not accessible yet

---

## Step 1: Deploy Application via AWS Console

### Connect to EC2:
1. Go to: **https://console.aws.amazon.com/ec2/**
2. Click **Instances** (left sidebar)
3. Find instance: **vocco-talk** (IP: 52.91.90.135)
4. Select it → Click **Connect** → **EC2 Instance Connect** → **Connect**

### Run Deployment Command:
Copy and paste this **entire command** in the browser terminal:

```bash
sudo yum update -y && curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs git && sudo npm install -g pm2 && cd ~ && git clone https://github.com/MuhammadSaljooq/support-website.git && cd support-website && npm install && npm run build && PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4) && cat > .env.local << EOF
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://${PUBLIC_IP}:3000"
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
VAPI_API_KEY=""
ENCRYPTION_KEY="$(openssl rand -hex 16)"
EOF
pm2 start npm --name support-website -- start && pm2 save && pm2 startup | grep -v "PM2" | bash && pm2 status
```

**This will take 5-10 minutes** (installing dependencies and building).

---

## Step 2: Update Environment Variables

After deployment completes:

```bash
nano .env.local
```

**Update `DATABASE_URL`** with your actual database connection string, then:

```bash
pm2 restart support-website
pm2 logs support-website
```

---

## Step 3: Open Your Website

Once deployment is complete, open:

```
http://52.91.90.135:3000
```

Or run:
```bash
open http://52.91.90.135:3000
```

---

## Quick Check Commands

### Check if app is running:
```bash
pm2 status
```

### View logs:
```bash
pm2 logs support-website
```

### Restart if needed:
```bash
pm2 restart support-website
```

---

## Troubleshooting

### Website still not loading?
1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs support-website`
3. Verify port 3000 is open (already configured ✅)
4. Make sure `.env.local` has correct `DATABASE_URL`

### Application errors?
- Check logs: `pm2 logs support-website`
- Verify database connection in `.env.local`
- Restart: `pm2 restart support-website`

---

**After deployment, your website will be at: http://52.91.90.135:3000** 🎉

