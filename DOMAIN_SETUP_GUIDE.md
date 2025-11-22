# 🌐 Domain Setup Guide - Quick Start

## Your EC2 Instance
- **Public IP**: `54.160.167.46`
- **Current URL**: http://54.160.167.46:3000

---

## Quick Setup (3 Steps)

### Step 1: Configure DNS

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add an **A Record**:

```
Type: A
Host: @ (for root domain) or www (for subdomain)
Value: 54.160.167.46
TTL: 300 (or Auto)
```

**Example:**
- Domain: `vocco-talk.com`
- A Record: `@` → `54.160.167.46`
- A Record: `www` → `54.160.167.46`

### Step 2: Setup Nginx (Remove :3000 from URL)

Connect to EC2 and run:

```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@54.160.167.46

# Copy and run this script
curl -fsSL https://raw.githubusercontent.com/MuhammadSaljooq/support-website/main/scripts/setup-nginx.sh -o setup-nginx.sh
chmod +x setup-nginx.sh
./setup-nginx.sh yourdomain.com
```

Or run manually:
```bash
# Install Nginx
sudo yum install -y nginx

# Create configuration
sudo nano /etc/nginx/conf.d/vocco-talk.conf
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Update .env.local:
```bash
cd ~/support-website
nano .env.local
# Change: NEXTAUTH_URL="http://yourdomain.com"
pm2 restart support-website
```

### Step 3: Setup SSL/HTTPS (Recommended)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain and email)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --email your@email.com
```

Update .env.local:
```bash
nano ~/support-website/.env.local
# Change: NEXTAUTH_URL="https://yourdomain.com"
pm2 restart support-website
```

---

## Automated Setup Scripts

I've created scripts to automate this:

### Setup Nginx:
```bash
./scripts/setup-nginx.sh yourdomain.com
```

### Setup SSL:
```bash
./scripts/setup-ssl.sh yourdomain.com
```

---

## Common Domain Registrars - Quick Links

- **GoDaddy**: https://dcc.godaddy.com/manage/
- **Namecheap**: https://ap.www.namecheap.com/domains/list/
- **Cloudflare**: https://dash.cloudflare.com/
- **Google Domains**: https://domains.google.com/registrar/
- **AWS Route 53**: https://console.aws.amazon.com/route53/

---

## Verify DNS

Check if your domain points to EC2:

```bash
# Check DNS resolution
dig yourdomain.com +short
# Should return: 54.160.167.46

# Or use nslookup
nslookup yourdomain.com

# Or check online
# https://www.whatsmydns.net/
```

---

## Timeline

- **DNS Setup**: 5 minutes
- **DNS Propagation**: 5 min - 48 hours (usually 10-30 minutes)
- **Nginx Setup**: 5 minutes
- **SSL Setup**: 5 minutes

**Total**: Usually 20-40 minutes for full setup

---

## What's Your Domain?

Tell me your domain name and I can help you with:
1. ✅ DNS configuration steps
2. ✅ Nginx setup for your domain
3. ✅ SSL certificate installation
4. ✅ Environment variable updates

---

**Ready to connect your domain?** 🚀

Just provide your domain name and I'll guide you through the setup!

