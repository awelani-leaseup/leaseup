# Effect-TS Integration Guide for Monthly Invoices

This document explains how to integrate your Effect-TS implementation (`runMonthlyInvoicesAsPromise`) into your current system. You have several options based on your requirements and infrastructure preferences.

## Option 1: Standalone Effect Cron Runner (Recommended)

**Best for:** Maximum Effect-TS benefits, simplified architecture, no external dependencies

This approach uses Effect's built-in cron scheduling and runs as a standalone Node.js process.

### How to Run

```bash
# Development (with hot reload)
cd packages/tasks
pnpm cron:dev

# Production
cd packages/tasks
pnpm cron

# Or directly with node
node --loader ts-node/esm src/cron-runner.ts
```

### Advantages

- **Native Effect scheduling**: Uses Effect's robust `Schedule.cron()` with built-in retries
- **Simplified architecture**: No external orchestrator needed
- **Better error handling**: Full Effect error management and retry policies
- **Resource efficiency**: Lightweight, runs as single process
- **Type safety**: End-to-end Effect type safety

### Production Deployment

For production, you can run this as:

1. **Systemd service** (Linux):

```ini
[Unit]
Description=Monthly Invoices Cron Runner
After=network.target

[Service]
Type=simple
User=your-app-user
WorkingDirectory=/path/to/your/app/packages/tasks
ExecStart=/usr/bin/node --loader ts-node/esm src/cron-runner.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

2. **Docker container**:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "--loader", "ts-node/esm", "src/cron-runner.ts"]
```

3. **PM2 process manager**:

```bash
pm2 start src/cron-runner.ts --name "invoice-cron" --interpreter="node --loader ts-node/esm"
```

## Option 2: Hybrid with Trigger.dev (Easiest Migration)

**Best for:** Keeping existing infrastructure, gradual migration, team familiarity

This approach keeps your trigger.dev setup but uses Effect logic internally.

### Implementation

The hybrid task is already created: `checkUpcomingInvoicesEffectTask`

### How to Use

1. **Update your trigger.dev deployment** to include the new task:

```bash
cd packages/tasks
pnpm deploy
```

2. **Disable the old task** in your trigger.dev dashboard
3. **Enable the new Effect-based task** (`check-upcoming-invoices-effect`)

### Advantages

- **Easy migration**: Minimal changes to existing infrastructure
- **Familiar tooling**: Keep trigger.dev dashboard and monitoring
- **Gradual adoption**: Can run both versions during transition
- **Team continuity**: No operational changes for your team

## Option 3: Direct Function Calls

**Best for:** Integration with other systems, API endpoints, manual triggers

You can call `runMonthlyInvoicesAsPromise()` directly from anywhere in your codebase:

```typescript
import { runMonthlyInvoicesAsPromise } from '@leaseup/tasks/trigger/send-monthly-invoices-effect';

// In an API route
app.post('/admin/trigger-invoices', async (req, res) => {
  try {
    const result = await runMonthlyInvoicesAsPromise();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In a one-off script
async function runInvoicesNow() {
  const result = await runMonthlyInvoicesAsPromise();
  console.log('Result:', result);
}
```

## Comparison Table

| Aspect               | Standalone Effect     | Hybrid Trigger.dev    | Direct Calls |
| -------------------- | --------------------- | --------------------- | ------------ |
| **Complexity**       | Low                   | Medium                | Very Low     |
| **Infrastructure**   | Self-managed          | Trigger.dev           | None         |
| **Monitoring**       | Custom/Effect logs    | Trigger.dev dashboard | Custom       |
| **Scaling**          | Manual                | Auto (Trigger.dev)    | Manual       |
| **Cost**             | Server resources only | Trigger.dev pricing   | None         |
| **Effect Benefits**  | Full                  | Partial               | Full         |
| **Migration Effort** | Medium                | Low                   | None         |

## Recommended Migration Path

1. **Phase 1**: Test the hybrid approach alongside your existing task
2. **Phase 2**: Switch to the hybrid approach in production
3. **Phase 3**: Evaluate moving to standalone Effect runner for maximum benefits

## Configuration

Both approaches use the same configuration from `InvoiceConfigLive`:

```typescript
const InvoiceConfigLive = Layer.succeed(InvoiceConfig, {
  checkDaysAhead: 50, // Look ahead 50 days for invoices
  batchSize: 10, // Process 10 invoices per batch
  batchDelayMs: 1000, // 1 second delay between batches
});
```

## Monitoring and Logging

### Effect Logs

Effect provides structured logging with different levels:

- `Effect.logInfo`: General information
- `Effect.logError`: Error conditions
- `Effect.logWarning`: Warning conditions

### Custom Logger Integration

You can integrate with your existing logger:

```typescript
import { runWithCustomLogger } from './send-monthly-invoices-effect';

const customLogger = {
  info: (msg: string, data: any) => console.log(`[INFO] ${msg}`, data),
  error: (msg: string, data: any) => console.error(`[ERROR] ${msg}`, data),
};

Effect.runPromise(runWithCustomLogger(customLogger));
```

## Troubleshooting

### Common Issues

1. **Database connection issues**: Check Prisma configuration
2. **Import errors**: Ensure all dependencies are installed
3. **Type errors**: Verify Effect and Prisma versions are compatible

### Environment Variables

Ensure these are set:

```env
DATABASE_URL=your_database_url
PAYSTACK_SECRET_KEY=your_paystack_key
# ... other required vars
```

## Next Steps

1. Choose your preferred approach based on your requirements
2. Test in development environment
3. Set up monitoring and alerting
4. Deploy to production with proper error handling
5. Monitor performance and adjust configuration as needed
