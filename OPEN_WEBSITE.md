# 🌐 Open Your Website

## Your Website URL

**Direct Link:**
```
http://52.91.90.135:3000
```

Click the link above or copy it into your browser.

---

## Quick Access Methods

### Method 1: Direct Browser Access
Simply open this URL in your browser:
```
http://52.91.90.135:3000
```

### Method 2: Open via Terminal (macOS)
```bash
open http://52.91.90.135:3000
```

### Method 3: Open via Command
```bash
# On macOS
open http://52.91.90.135:3000

# On Linux
xdg-open http://52.91.90.135:3000

# On Windows
start http://52.91.90.135:3000
```

---

## Check Website Status

### Check if website is running:
```bash
curl -I http://52.91.90.135:3000
```

### Check application status on EC2:
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@52.91.90.135 "pm2 status"
```

### View application logs:
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@52.91.90.135 "pm2 logs support-website"
```

---

## If Website is Not Loading

### 1. Check if application is running:
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@52.91.90.135
pm2 status
```

If not running, start it:
```bash
cd support-website
pm2 start npm --name support-website -- start
pm2 save
```

### 2. Check security group:
Port 3000 should be open. Verify:
```bash
aws ec2 describe-security-groups --group-ids sg-07e8e946faea4b405 --query 'SecurityGroups[0].IpPermissions[?FromPort==`3000`]'
```

### 3. Check application logs:
```bash
pm2 logs support-website
```

### 4. Restart application:
```bash
pm2 restart support-website
```

---

## Instance Information

- **Instance ID**: `i-08b6cfd903e6e7bbe`
- **Name**: `vocco-talk`
- **Public IP**: `52.91.90.135`
- **Website URL**: `http://52.91.90.135:3000`

---

## Next Steps

1. ✅ Open the website: http://52.91.90.135:3000
2. ⏳ If it doesn't load, check if the app is running (see commands above)
3. ⏳ Make sure `.env.local` is configured with your database URL
4. ⏳ Check logs if there are any errors

---

**Your website is ready to access!** 🚀

