# 🔧 Troubleshooting Deployment Issues

## Common Issues and Solutions

### Issue 1: Cannot Connect via SSM

**Error:** "Instances not in a valid state for account" or "Target not connected"

**Solution:** The instance needs an IAM role with SSM permissions.

**Fix:**
1. Go to AWS Console → EC2 → Instances
2. Select instance `i-09fb878a140c50cbe`
3. Actions → Security → Modify IAM role
4. Attach IAM role with `AmazonSSMManagedInstanceCore` policy
5. Or use SSH instead

### Issue 2: SSH Connection Timeout

**Error:** "Connection timed out" or "Connection refused"

**Solutions:**

**A. Check Security Group:**
```bash
# Ensure port 22 is open
aws ec2 authorize-security-group-ingress \
  --group-id sg-0b3dbfb87f2761d5c \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

**B. Use EC2 Instance Connect:**
```bash
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-09fb878a140c50cbe \
  --availability-zone us-east-1a \
  --instance-os-user ec2-user \
  --ssh-public-key file://~/.ssh/id_rsa.pub
```

**C. Check if instance is running:**
```bash
aws ec2 describe-instances --instance-ids i-09fb878a140c50cbe --query 'Reservations[0].Instances[0].State.Name'
```

### Issue 3: Deployment Commands Fail

**Error:** Commands fail or timeout

**Solution:** Run commands step by step:

```bash
# Connect first
aws ssm start-session --target i-09fb878a140c50cbe

# Then run each step separately:
sudo yum update -y
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git
sudo npm install -g pm2
cd ~
git clone https://github.com/MuhammadSaljooq/support-website.git
cd support-website
npm install
npm run build
pm2 start npm --name support-website -- start
pm2 save
```

### Issue 4: Port 3000 Not Accessible

**Error:** Cannot access website at http://100.25.216.241:3000

**Solution:** Ensure security group allows port 3000:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0b3dbfb87f2761d5c \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0
```

### Issue 5: Application Crashes

**Error:** PM2 shows app as stopped or errored

**Solution:** Check logs:

```bash
pm2 logs support-website
pm2 status
```

Common causes:
- Missing `.env.local` file
- Database connection issues
- Port already in use

---

## Alternative: Use EC2 Instance Connect

If SSM and SSH don't work, try EC2 Instance Connect:

```bash
# Generate SSH key if needed
ssh-keygen -t rsa -f ~/.ssh/ec2-connect

# Send public key
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-09fb878a140c50cbe \
  --availability-zone us-east-1a \
  --instance-os-user ec2-user \
  --ssh-public-key file://~/.ssh/ec2-connect.pub

# Connect
ssh -i ~/.ssh/ec2-connect ec2-user@100.25.216.241
```

---

## Quick Diagnostic Commands

```bash
# Check instance status
aws ec2 describe-instances --instance-ids i-09fb878a140c50cbe --query 'Reservations[0].Instances[0].{State:State.Name,PublicIP:PublicIpAddress}'

# Check security groups
aws ec2 describe-instances --instance-ids i-09fb878a140c50cbe --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId'

# Test port 3000
curl -I http://100.25.216.241:3000

# Check if PM2 is running (after connecting)
pm2 status
```

---

## Manual Deployment via AWS Console

If command line doesn't work:

1. Go to AWS Console → EC2 → Instances
2. Select instance `i-09fb878a140c50cbe`
3. Click "Connect"
4. Choose "EC2 Instance Connect" or "Session Manager"
5. Run deployment commands in the browser terminal

---

## Need More Help?

Share the specific error message you're seeing, and I can help troubleshoot!

