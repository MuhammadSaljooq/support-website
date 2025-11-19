# 🔗 How to Connect Your GitHub Account

There are two main ways to connect your GitHub account: **HTTPS** (easier) or **SSH** (more secure). Choose the method you prefer.

---

## Method 1: HTTPS with Personal Access Token (Recommended for Beginners)

### Step 1: Create a Personal Access Token on GitHub

1. Go to GitHub.com and sign in
2. Click your profile picture → **Settings**
3. Scroll down to **Developer settings** (bottom left)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Give it a name: `Support Website`
7. Select expiration: Choose your preference (90 days, 1 year, or no expiration)
8. Select scopes: Check **`repo`** (this gives full control of private repositories)
9. Click **Generate token**
10. **IMPORTANT**: Copy the token immediately (you won't see it again!)

### Step 2: Configure Git Credentials

**Option A: Use Git Credential Manager (macOS)**

```bash
git config --global credential.helper osxkeychain
```

**Option B: Store credentials in Git config (less secure)**

```bash
git config --global user.name "Your GitHub Username"
git config --global user.email "your-github-email@example.com"
```

### Step 3: Connect Your Repository

```bash
cd "/Users/shireenafzal/Suppoort website"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# When you push, GitHub will ask for:
# Username: YOUR_GITHUB_USERNAME
# Password: PASTE_YOUR_PERSONAL_ACCESS_TOKEN (not your actual password!)
git push -u origin main
```

---

## Method 2: SSH Keys (More Secure, Recommended for Advanced Users)

### Step 1: Check if you already have SSH keys

```bash
ls -al ~/.ssh
```

Look for files named `id_rsa.pub` or `id_ed25519.pub`

### Step 2: Generate a new SSH key (if you don't have one)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- Press Enter to accept default file location
- Enter a passphrase (optional but recommended)
- Your public key will be saved to `~/.ssh/id_ed25519.pub`

### Step 3: Add SSH key to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the entire output (starts with `ssh-ed25519`)

2. Go to GitHub.com → Settings → **SSH and GPG keys**
3. Click **New SSH key**
4. Title: `MacBook` (or any name)
5. Key: Paste your public key
6. Click **Add SSH key**

### Step 4: Test SSH connection

```bash
ssh -T git@github.com
```

You should see: `Hi YOUR_USERNAME! You've successfully authenticated...`

### Step 5: Connect Your Repository

```bash
cd "/Users/shireenafzal/Suppoort website"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

---

## Quick Setup Commands

### If using HTTPS:

```bash
# 1. Set your git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Push your code
git push -u origin main
```

### If using SSH:

```bash
# 1. Set your git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Push your code
git push -u origin main
```

---

## Verify Connection

After connecting, verify it worked:

```bash
git remote -v
```

You should see your GitHub repository URL listed.

---

## Troubleshooting

### "Permission denied" error
- **HTTPS**: Make sure you're using a Personal Access Token, not your password
- **SSH**: Make sure your SSH key is added to GitHub

### "Repository not found" error
- Make sure the repository exists on GitHub
- Check that you have access to the repository
- Verify the repository name and username are correct

### Need to change remote URL?

```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin YOUR_NEW_URL
```

---

## Which Method Should I Use?

- **HTTPS**: Easier to set up, works everywhere, requires token for each push
- **SSH**: More secure, no password/token needed after setup, requires SSH key setup

For most users, **HTTPS with Personal Access Token** is the easiest option.

