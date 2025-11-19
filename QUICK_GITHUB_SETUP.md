# 🚀 Quick GitHub Setup (Using GitHub CLI)

You have GitHub CLI installed! This is the easiest way to connect.

## Step 1: Authenticate with GitHub

Run this command in your terminal:

```bash
gh auth login
```

Follow the prompts:
1. **What account do you want to log into?** → Choose `GitHub.com`
2. **What is your preferred protocol?** → Choose `HTTPS` (easier) or `SSH` (more secure)
3. **Authenticate Git with your GitHub credentials?** → Choose `Yes`
4. **How would you like to authenticate?** → Choose `Login with a web browser` (easiest)
5. Press Enter, then copy the code shown
6. Your browser will open → paste the code and authorize

## Step 2: Create Repository on GitHub

Run this command:

```bash
cd "/Users/shireenafzal/Suppoort website"
gh repo create support-website --public --source=. --remote=origin --push
```

This will:
- Create a repository called `support-website` on GitHub
- Set it as your remote origin
- Push your code automatically

**OR** if you want to use an existing repository:

```bash
gh repo create YOUR_REPO_NAME --public --source=. --remote=origin --push
```

## Step 3: Verify Connection

```bash
git remote -v
```

You should see your GitHub repository URL.

## Alternative: Manual Setup

If you prefer to do it manually:

1. **Create repository on GitHub.com**:
   - Go to https://github.com/new
   - Name: `support-website`
   - Click "Create repository"

2. **Connect and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/support-website.git
   git push -u origin main
   ```

## Done! 🎉

Your code is now on GitHub!

