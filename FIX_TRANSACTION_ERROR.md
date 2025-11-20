# 🔧 Fix Transaction Test Error

## Problem
Getting "Transaction test error" during `yum update` or package installation.

## Solution: Run Commands Step by Step

Instead of running everything at once, run commands **one at a time**:

### Step 1: Update System (Skip if it fails)
```bash
sudo yum update -y
```

If this fails, skip it and continue to Step 2.

### Step 2: Install Node.js
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### Step 3: Install Git
```bash
sudo yum install -y git
```

### Step 4: Install PM2
```bash
sudo npm install -g pm2
```

### Step 5: Clone Repository
```bash
cd ~
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website
```

### Step 6: Install Dependencies
```bash
npm install
```

### Step 7: Build Application
```bash
npm run build
```

### Step 8: Create Environment File
```bash
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
```

### Step 9: Start Application
```bash
pm2 start npm --name support-website -- start
pm2 save
pm2 startup
# Run the command it outputs (starts with "sudo env PATH=...")
```

---

## Alternative: Skip System Update

If `yum update` keeps failing, skip it:

```bash
# Skip update, go straight to Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git
sudo npm install -g pm2
cd ~
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website
npm install
npm run build
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
pm2 start npm --name support-website -- start
pm2 save
pm2 startup | grep -v "PM2" | bash
```

---

## Quick Fix Commands

If you're stuck, try these:

### Clear yum cache:
```bash
sudo yum clean all
sudo yum makecache
```

### Try installing without update:
```bash
sudo yum install -y nodejs git --skip-broken
```

### Use dnf instead of yum (if available):
```bash
sudo dnf install -y nodejs git
```

---

## Recommended Approach

**Run commands one at a time** instead of chaining them with `&&`. This way:
- ✅ You can see exactly which command fails
- ✅ You can skip problematic commands
- ✅ You can continue from where it failed

---

**Try running the commands step by step - it's more reliable!** 🚀

