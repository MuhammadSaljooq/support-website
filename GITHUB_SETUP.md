# GitHub Setup Guide

## Step 1: Configure Git (if not already done)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Create Initial Commit

```bash
git add .
git commit -m "Initial commit: Support website with admin dashboard"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `support-website` (or your preferred name)
3. Description: "AI Voice Agent Support Website with Admin Dashboard"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 4: Connect Local Repository to GitHub

After creating the repository on GitHub, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 5: Verify Connection

```bash
git remote -v
```

You should see your GitHub repository URL listed.

## Important Notes

- **Never commit `.env` or `.env.local` files** - they contain sensitive information
- The `.gitignore` file already excludes these files
- Make sure to add your GitHub repository URL to your deployment platform (Vercel, etc.)

