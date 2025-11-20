# ✅ vocco-talk EC2 Instance - Deployment Complete

## Instance Details

- **Instance ID**: `i-08b6cfd903e6e7bbe`
- **Name**: `vocco-talk`
- **Public IP**: `52.91.90.135`
- **Status**: ✅ Running
- **Security Group**: `sg-07e8e946faea4b405`
  - Port 22 (SSH): ✅ Open
  - Port 3000 (App): ✅ Open
  - Port 80 (HTTP): ✅ Open
  - Port 443 (HTTPS): ✅ Open

---

## 🌐 Access Your Website

Your website is running at:
```
http://52.91.90.135:3000
```

---

## 📝 Environment Variables

The `.env.local` file has been created with auto-generated secrets. **You need to update it with your actual values:**

### Connect to update:
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@52.91.90.135
```

### Edit environment file:
```bash
cd support-website
nano .env.local
```

### Required Updates:
1. **DATABASE_URL** - Update with your PostgreSQL database connection string
2. **VAPI_API_KEY** - Add your Vapi API key if using
3. **STRIPE keys** - Add if using Stripe payments

### After editing, restart:
```bash
pm2 restart support-website
pm2 logs support-website
```

---

## 🔧 Management Commands

### Connect to Instance:
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@52.91.90.135
```

### Check Application Status:
```bash
pm2 status
pm2 logs support-website
```

### Restart Application:
```bash
pm2 restart support-website
```

### Stop Application:
```bash
pm2 stop support-website
```

### Update Code:
```bash
cd support-website
git pull
npm install
npm run build
pm2 restart support-website
```

---

## 📊 What's Installed

- ✅ Node.js 18.20.8
- ✅ npm 10.8.2
- ✅ Git
- ✅ PM2 (Process Manager)
- ✅ PostgreSQL client
- ✅ Your website application
- ✅ All dependencies installed
- ✅ Application built and running

---

## 🔒 Security Notes

1. **Update .env.local** with your actual database credentials
2. **Change default secrets** if needed
3. **Keep your SSH key secure** (`~/.ssh/vocco-talk.pem`)
4. **Regularly update** the system: `sudo yum update -y`

---

## 🆘 Troubleshooting

### Website not accessible?
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs support-website

# Check if port 3000 is listening
netstat -tlnp | grep 3000
```

### Application crashed?
```bash
# View error logs
pm2 logs support-website --err

# Restart
pm2 restart support-website
```

### Need to redeploy?
```bash
cd support-website
git pull
npm install
npm run build
pm2 restart support-website
```

---

## ✅ Next Steps

1. ✅ Instance created and running
2. ✅ Application deployed
3. ⏳ **Update .env.local with your database URL**
4. ⏳ **Add your API keys (Vapi, Stripe)**
5. ⏳ **Restart application after updating .env.local**
6. ✅ Access your website at http://52.91.90.135:3000

---

**Your website is ready! Just update the environment variables and you're good to go!** 🚀

