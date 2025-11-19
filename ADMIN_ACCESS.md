# 🔐 Admin Dashboard Access Guide

## How to Access the Admin Dashboard

### Step 1: Make Yourself an Admin

First, you need to make your user account an admin. Run this command in your terminal:

```bash
npm run make-admin <your-email>
```

**Example:**
```bash
npm run make-admin admin@example.com
```

This will update your user role to `ADMIN` in the database.

### Step 2: Access Admin Login Page

**Important:** You must use the **separate admin login page**, not the regular login page.

1. **Go to:** `http://localhost:3000/admin/login`
   
   OR navigate directly to: `/admin/login`

2. **Log in** with your admin credentials (email and password)

3. You'll be redirected to `/admin` dashboard

### Step 3: Alternative Access Methods

#### Option A: From Regular Dashboard
If you're already logged in as an admin, you'll see an **"Admin Dashboard"** button in the top-right of your regular dashboard. Click it to access the admin panel.

#### Option B: Direct URL
Once logged in as admin, you can directly access:
- `/admin` - Admin overview
- `/admin/users` - User management
- `/admin/agents` - Agent management
- `/admin/database` - Database explorer
- `/admin/users-with-agents` - Users who have agents

## Troubleshooting

### Issue: "Access denied. Admin privileges required."

**Solution:**
1. Make sure you ran `npm run make-admin <your-email>` with the correct email
2. Verify your user is an admin:
   ```bash
   # Check in database
   psql support_website -c "SELECT email, role FROM \"User\" WHERE email='your-email@example.com';"
   ```
3. Log out completely and log back in at `/admin/login`

### Issue: Still seeing regular dashboard after login

**Solution:**
1. Make sure you're using `/admin/login` NOT `/login`
2. Clear your browser cookies/session
3. Restart your dev server
4. Try logging in again at `/admin/login`

### Issue: Admin button not showing in regular dashboard

**Solution:**
1. Verify you're an admin: Check database or run the make-admin script again
2. Refresh the page
3. The button only appears if you're logged in as an admin

## Quick Verification

To verify you're an admin, check the database:

```bash
psql support_website -c "SELECT email, role FROM \"User\" WHERE role='ADMIN';"
```

You should see your email listed with role `ADMIN`.

## Admin Features

Once you have admin access, you can:

✅ **Manage Users**
- View all users
- Edit user details
- Change user roles (make users admins)
- Delete users
- View users with agents

✅ **Manage Agents**
- View all agents across all users
- Edit agent details
- Activate/deactivate agents
- Delete agents
- View agent usage statistics

✅ **Database Explorer**
- Browse all database tables
- View table data
- Search records
- Export data to CSV

✅ **System Analytics**
- View system-wide statistics
- Monitor usage across all users
- Track agent performance

## Security Notes

- Admin routes are protected by middleware
- Only users with `role = 'ADMIN'` can access `/admin/*` routes
- Admin login page is separate from regular login
- Non-admins are automatically redirected to regular dashboard

