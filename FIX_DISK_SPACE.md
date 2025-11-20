# 💾 Fix Disk Space Issue

## Problem
EC2 instance has run out of disk space. The t2.micro instance has limited storage.

## Solution: Free Up Space

Run these commands in your EC2 terminal:

### Step 1: Check Disk Space
```bash
df -h
```

### Step 2: Clean Up System
```bash
# Clean yum cache
sudo yum clean all

# Remove old kernels (if any)
sudo package-cleanup --oldkernels --count=1 || true

# Clean npm cache
npm cache clean --force

# Clean temporary files
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
```

### Step 3: Remove Unnecessary Packages
```bash
# Remove unnecessary packages
sudo yum autoremove -y
```

### Step 4: Check What's Using Space
```bash
# Find large files/directories
sudo du -h --max-depth=1 / | sort -hr | head -20
```

### Step 5: Clean Node Modules (If Rebuilding)
```bash
cd ~/support-website
rm -rf node_modules
rm -rf .next
```

### Step 6: Reinstall and Build (With Less Space)
```bash
# Install only production dependencies (smaller)
npm install --production=false

# Build with minimal output
npm run build
```

---

## Alternative: Increase Disk Size

If cleaning doesn't help, increase the EBS volume size:

### Via AWS Console:
1. Go to **EC2** → **Volumes**
2. Find volume attached to instance `i-08b6cfd903e6e7bbe`
3. Select it → **Actions** → **Modify Volume**
4. Increase size (e.g., 20 GB → 30 GB)
5. **Modify**
6. Extend filesystem:
   ```bash
   sudo growpart /dev/xvda 1
   sudo xfs_growfs / || sudo resize2fs /dev/xvda1
   ```

---

## Quick Fix Commands (Run All)

Copy and paste this to free up space:

```bash
sudo yum clean all && npm cache clean --force && sudo rm -rf /tmp/* /var/tmp/* && cd ~/support-website && rm -rf node_modules .next && npm install && npm run build
```

---

## Minimal Build Approach

If still low on space, try:

```bash
# Use less disk space during build
NODE_OPTIONS="--max-old-space-size=512" npm run build
```

---

## Check After Cleanup

```bash
df -h
```

You should see more free space. Then retry:
```bash
npm run build
```

---

**Try the cleanup commands first - they usually free up enough space!** 🚀

