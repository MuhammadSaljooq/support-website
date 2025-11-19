# Multiple Vapi Agents Management Guide

## Overview

Your application now supports **multiple Vapi agents per user**. Each user can create and manage multiple agents, each with its own API key and separate metrics tracking.

## Key Features

✅ **Multiple Agents**: Each user can have unlimited Vapi agents  
✅ **Separate API Keys**: Each agent has its own Vapi API key  
✅ **Individual Metrics**: Usage metrics tracked per agent  
✅ **Agent Management**: Create, edit, activate/deactivate, and delete agents  
✅ **Per-Agent Sync**: Sync metrics for specific agents  
✅ **Usage Analytics**: View usage stats per agent  

## How It Works

### Database Structure

- **VapiAgent** model: Stores agent information
  - `id` - Unique agent ID
  - `userId` - Owner user ID
  - `name` - User-friendly agent name
  - `apiKey` - Encrypted Vapi API key
  - `agentId` - Optional Vapi agent ID reference
  - `isActive` - Active/inactive status
  - `lastSyncedAt` - Last sync timestamp

- **Usage** model: Tracks usage per agent
  - `vapiAgentId` - Links usage to specific agent
  - Metrics stored separately per agent

### User Flow

1. **Create Agent**: User adds a new agent with name and API key
2. **Sync Metrics**: User syncs metrics for that specific agent
3. **View Stats**: Dashboard shows aggregated or per-agent stats
4. **Manage**: Edit, activate/deactivate, or delete agents

## API Endpoints

### List All Agents
```
GET /api/vapi/agents
Response: { agents: [...] }
```

### Create Agent
```
POST /api/vapi/agents
Body: {
  "name": "Medical Support Agent",
  "apiKey": "vapi_api_key_here",
  "agentId": "optional_vapi_agent_id"
}
```

### Update Agent
```
PATCH /api/vapi/agents?id=agent_id
Body: {
  "name": "Updated Name",  // optional
  "apiKey": "new_key",     // optional (only if updating)
  "agentId": "new_id",     // optional
  "isActive": true         // optional
}
```

### Delete Agent
```
DELETE /api/vapi/agents?id=agent_id
```

### Sync Metrics for Agent
```
POST /api/vapi/sync
Body: {
  "agentId": "agent_id",
  "startDate": "2024-01-01",  // optional
  "endDate": "2024-01-31"     // optional
}
```

### Get Metrics for Agent
```
GET /api/vapi/metrics?agentId=agent_id&startDate=2024-01-01&endDate=2024-01-31
```

## Usage in Dashboard

### Settings Page
- Go to Dashboard → Settings → Vapi Integration
- View all your agents
- Create new agents
- Edit agent details
- Sync metrics per agent
- Activate/deactivate agents
- Delete agents

### Dashboard Overview
- Shows aggregated stats from all active agents
- Or filter by specific agent

### Usage Page
- Filter usage by agent
- View per-agent analytics
- Compare agent performance

## Example Use Cases

### Medical Practice
- Agent 1: "Patient Scheduling" - handles appointment calls
- Agent 2: "Prescription Refills" - handles medication requests
- Agent 3: "Emergency Triage" - handles urgent calls

### Support Company
- Agent 1: "Technical Support" - handles tech issues
- Agent 2: "Billing Support" - handles payment questions
- Agent 3: "Product Information" - handles product inquiries

### Construction Business
- Agent 1: "Quote Requests" - handles project quotes
- Agent 2: "Service Scheduling" - handles service calls
- Agent 3: "Emergency Dispatch" - handles urgent requests

## Security

- Each API key is encrypted separately
- Keys are never exposed in API responses
- Users can only access their own agents
- Agent deletion preserves historical usage data

## Best Practices

1. **Name Your Agents Clearly**: Use descriptive names like "Medical Support" instead of "Agent 1"
2. **Keep Agents Active**: Deactivate unused agents instead of deleting (preserves history)
3. **Regular Syncs**: Sync metrics regularly to keep data up-to-date
4. **Monitor Costs**: Track costs per agent to optimize spending
5. **Test Before Production**: Verify API keys work before marking agents as active

## Migration Notes

- Old single-agent integration has been replaced
- Users need to recreate their agents in the new system
- Historical data structure remains compatible
- New `vapiAgentId` field added to Usage table

