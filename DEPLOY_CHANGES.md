# 🚀 Deploy All Changes to EC2

## Quick Deploy (Automated)

Run this single command to commit, push, and deploy all your changes:

```bash
./scripts/deploy-all.sh
```

This will:
1. ✅ Stage all your changes
2. ✅ Commit them with a message
3. ✅ Push to GitHub
4. ✅ Connect to EC2
5. ✅ Pull latest code
6. ✅ Install dependencies
7. ✅ Build the application
8. ✅ Restart with PM2

---

## Manual Deployment (Step by Step)

### Step 1: Commit and Push Changes

```bash
# Stage all changes
git add -A

# Commit
git commit -m "Deploy: Update MongoDB configuration and login logging"

# Push to GitHub
git push origin main
```

### Step 2: Connect to EC2

**Option A: SSH (if you have the key)**
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@54.160.167.46
```

**Option B: AWS Console (Easiest)**
1. Go to: https://console.aws.amazon.com/ec2/
2. Select instance: `i-097e41b2265c4b372`
3. Click **Connect** → **EC2 Instance Connect** → **Connect**

### Step 3: Deploy on EC2

Once connected to EC2, run:

```bash
# Navigate to your app directory
cd ~/support-website

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Restart the application
pm2 restart support-website

# Check status
pm2 status
```

---

## One-Line Deployment (If Already Connected)

If you're already connected to EC2 via AWS Console, just run:

```bash
cd ~/support-website && git pull && npm install && npm run build && pm2 restart support-website && pm2 status
```

---

## Important Notes

### Environment Variables
Make sure your `.env.local` on EC2 has the MongoDB connection string:

```env
DATABASE_URL="mongodb+srv://msaljooq13:lahore789L@cluster0.5osbgnw.mongodb.net/vocco_talk_db?retryWrites=true&w=majority"
```

After updating `.env.local`, restart:
```bash
pm2 restart support-website
```

### Check Application Status

```bash
# View logs
pm2 logs support-website

# Check status
pm2 status

# Restart if needed
pm2 restart support-website
```

---

## Your EC2 Details

- **Instance ID**: `i-097e41b2265c4b372`
- **Public IP**: `54.160.167.46`
- **Website URL**: `http://54.160.167.46:3000`

---

## Troubleshooting

### If deployment fails:

1. **Check if app is running:**
   ```bash
   pm2 status
   ```

2. **View error logs:**
   ```bash
   pm2 logs support-website --err
   ```

3. **Check if port 3000 is open:**
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

4. **Restart from scratch:**
   ```bash
   pm2 delete support-website
   cd ~/support-website
   npm install
   npm run build
   pm2 start npm --name support-website -- start
   pm2 save
   ```

