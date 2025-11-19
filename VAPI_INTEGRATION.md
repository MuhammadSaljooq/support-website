# Vapi Integration Guide

## Overview

Your application now supports integration with Vapi to automatically sync usage metrics and costs from your Vapi voice agent.

## Features

- ✅ Connect/disconnect Vapi account
- ✅ Secure API key storage (encrypted)
- ✅ Fetch usage metrics (minutes, calls, costs)
- ✅ Sync metrics to your dashboard
- ✅ View Vapi usage in dashboard

## Setup

### 1. Get Your Vapi API Key

1. Log in to your [Vapi Dashboard](https://dashboard.vapi.ai)
2. Go to Settings → API Keys
3. Copy your API key

### 2. Connect Your Account

1. Go to Dashboard → Settings → Vapi Integration
2. Enter your Vapi API key
3. Click "Connect Vapi Account"
4. Your account will be verified and connected

### 3. Sync Metrics

- Click "Sync Now" to manually sync metrics
- Metrics are automatically synced when you view the dashboard
- Metrics include:
  - Minutes used
  - Call count
  - Total costs

## API Endpoints

### Connect Vapi Account
```
POST /api/vapi/connect
Body: { "apiKey": "your-vapi-api-key" }
```

### Disconnect Vapi Account
```
DELETE /api/vapi/connect
```

### Get Integration Status
```
GET /api/vapi/connect
```

### Fetch Metrics
```
GET /api/vapi/metrics?startDate=2024-01-01&endDate=2024-01-31
```

### Sync Metrics (stores in database)
```
POST /api/vapi/sync
Body: { "startDate": "2024-01-01", "endDate": "2024-01-31" } (optional)
```

## Security

- API keys are encrypted using AES-256-GCM
- Encryption key stored in `ENCRYPTION_KEY` environment variable
- Keys are never exposed in API responses
- In production, use AWS KMS or similar for key management

## Environment Variables

Add to your `.env.local`:

```bash
# Encryption key for API keys (must be at least 32 characters)
ENCRYPTION_KEY="your-secure-encryption-key-at-least-32-characters-long"
```

## Database Schema

The `VapiIntegration` table stores:
- `id` - Unique identifier
- `userId` - Reference to User
- `apiKey` - Encrypted Vapi API key
- `isConnected` - Connection status
- `lastSyncedAt` - Last sync timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Usage in Dashboard

Once connected, Vapi metrics will appear in:
- Dashboard overview (usage stats)
- Usage page (detailed analytics)
- Billing page (costs)

## Troubleshooting

### "Invalid API key" error
- Verify your API key in Vapi dashboard
- Make sure you copied the full key
- Check that the key hasn't expired

### "Failed to sync metrics" error
- Check your internet connection
- Verify Vapi API is accessible
- Check server logs for detailed error messages

### Metrics not showing
- Click "Sync Now" to manually sync
- Check that your Vapi account has usage data
- Verify the date range is correct

## Next Steps

1. Connect your Vapi account in Settings
2. Sync metrics to see your usage
3. View metrics in Dashboard → Usage page
4. Monitor costs in Dashboard → Billing page

