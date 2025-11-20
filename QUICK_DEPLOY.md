# ⚡ Quick Deploy to EC2

## ✅ Your EC2 Instance is Ready!

- **Instance ID**: `i-09fb878a140c50cbe`
- **Public IP**: `100.25.216.241`
- **Status**: ✅ Running
- **Key Pair**: `vocco-talk`

---

## 🚀 Deploy Your Website

### Option 1: Automated Deployment (Recommended)

Run this script to automatically deploy:

```bash
./scripts/connect-and-deploy.sh
```

This will:
1. ✅ Connect to your EC2 instance
2. ✅ Install Node.js, Git, PM2
3. ✅ Clone your GitHub repository
4. ✅ Install dependencies
5. ✅ Build the application
6. ✅ Start with PM2

### Option 2: Manual Deployment

#### Step 1: Connect to EC2

**Using AWS Systems Manager (No SSH Key Needed):**
```bash
aws ssm start-session --target i-09fb878a140c50cbe
```

**Or using SSH (if you have the key):**
```bash
ssh -i ~/.ssh/vocco-talk.pem ec2-user@100.25.216.241
```

#### Step 2: Run These Commands on EC2

Once connected, run:

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website

# Install dependencies
npm install

# Build application
npm run build

# Create .env.local (IMPORTANT!)
nano .env.local
```

#### Step 3: Configure Environment Variables

Add your environment variables to `.env.local`:

```bash
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://100.25.216.241:3000"
VAPI_API_KEY="your-vapi-key"
ENCRYPTION_KEY="your-32-character-key"
# ... add other variables
```

#### Step 4: Start Application

```bash
# Start with PM2
pm2 start npm --name "support-website" -- start
pm2 save
pm2 startup
# Run the command it outputs
```

---

## 🔒 Configure Security Group

Your EC2 security group must allow port 3000:

```bash
# Add rule for port 3000
aws ec2 authorize-security-group-ingress \
  --group-id sg-0b3dbfb87f2761d5c \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0
```

Or via AWS Console:
1. Go to **EC2** → **Security Groups**
2. Select `sg-0b3dbfb87f2761d5c`
3. **Inbound rules** → **Edit**
4. Add rule:
   - **Type**: Custom TCP
   - **Port**: 3000
   - **Source**: 0.0.0.0/0
5. **Save rules**

---

## 🌐 Access Your Website

After deployment, your website will be available at:

```
http://100.25.216.241:3000
```

---

## 📊 Manage Your Application

```bash
# Connect to EC2
aws ssm start-session --target i-09fb878a140c50cbe

# Check status
pm2 status

# View logs
pm2 logs support-website

# Restart
pm2 restart support-website

# Stop
pm2 stop support-website
```

---

## ✅ Quick Commands

```bash
# Connect and deploy
./scripts/connect-and-deploy.sh

# Connect only
aws ssm start-session --target i-09fb878a140c50cbe

# Check instance status
aws ec2 describe-instances --instance-ids i-09fb878a140c50cbe --query 'Reservations[0].Instances[0].{State:State.Name,PublicIP:PublicIpAddress}' --output json

# Open port 3000
aws ec2 authorize-security-group-ingress --group-id sg-0b3dbfb87f2761d5c --protocol tcp --port 3000 --cidr 0.0.0.0/0
```

---

## 🆘 Troubleshooting

### Can't connect
- ✅ Use Systems Manager: `aws ssm start-session --target i-09fb878a140c50cbe`
- ✅ Check instance is running

### Port 3000 not accessible
- ✅ Add security group rule for port 3000
- ✅ Check PM2 status: `pm2 status`
- ✅ Check logs: `pm2 logs support-website`

### Application errors
- ✅ Check `.env.local` is configured correctly
- ✅ Verify database connection
- ✅ Check logs: `pm2 logs support-website`

---

## 🎯 Next Steps

1. ✅ Deploy the application
2. ✅ Configure security group (port 3000)
3. ✅ Set up domain name (optional)
4. ✅ Configure SSL certificate (optional)

Your instance is ready! Start deploying now! 🚀

