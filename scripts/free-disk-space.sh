#!/bin/bash
# Free up disk space on EC2 instance

echo "💾 Freeing Up Disk Space"
echo "========================"
echo ""

# Check current space
echo "📊 Current disk usage:"
df -h /
echo ""

# Clean yum cache
echo "🧹 Cleaning yum cache..."
sudo yum clean all

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Clean temporary files
echo "🧹 Cleaning temporary files..."
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Remove old logs
echo "🧹 Cleaning old logs..."
sudo journalctl --vacuum-time=1d 2>/dev/null || true

# Remove unnecessary packages
echo "🧹 Removing unnecessary packages..."
sudo yum autoremove -y 2>/dev/null || true

# Check space after cleanup
echo ""
echo "📊 Disk usage after cleanup:"
df -h /
echo ""

# Find large directories
echo "📁 Largest directories:"
sudo du -h --max-depth=1 /home 2>/dev/null | sort -hr | head -10 || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Now try: cd ~/support-website && npm run build"

