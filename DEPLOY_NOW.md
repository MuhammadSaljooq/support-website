# 🚀 Deploy Your Website Now

## Quick Deploy (2 Steps)

### Step 1: Connect to EC2

Open your terminal and run:

```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

### Step 2: Run This Command

Once connected, copy and paste this **entire command**:

```bash
sudo yum update -y && curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs git && sudo npm install -g pm2 && cd ~ && ([ -d support-website ] && (cd support-website && git pull) || git clone https://github.com/MuhammadSaljooq/support-website.git) && cd support-website && npm install && npm run build && pm2 stop support-website 2>/dev/null || true && pm2 delete support-website 2>/dev/null || true && pm2 start npm --name support-website -- start && pm2 save && echo '' && echo '✅ Deployment complete! Your website is at: http://100.25.216.241:3000' && pm2 status
```

**That's it!** Your website will be deployed and running.

---

## After Deployment

### Configure Environment Variables

```bash
nano .env.local
```

Add your database URL and other secrets, then:

```bash
pm2 restart support-website
```

### Check Status

```bash
pm2 status
pm2 logs support-website
```

---

## Access Your Website

After deployment, visit:
```
http://100.25.216.241:3000
```

---

**Instance Details:**
- Instance ID: `i-09fb878a140c50cbe`
- Public IP: `100.25.216.241`
- Status: ✅ Running
- Port 3000: ✅ Open

