# AFFiNE Complete Isolation Guide

## Issue Summary
AFFiNE, even when self-hosted, still connects to official AFFiNE servers for:
1. **Telemetry** - Usage data collection
2. **Sentry** - Error reporting
3. **Updates** - Checking for new versions (Electron only)

## External Connections Breakdown

### 1. Telemetry (Primary Concern)
**File:** `packages/frontend/core/src/modules/cloud/constant.ts` (lines 198-218)

Hardcoded endpoints:
```
stable: https://app.affine.pro
beta: https://insider.affine.pro
internal: https://insider.affine.pro
canary: https://affine.fail
```

**How it works:**
- Frontend sends telemetry events to `/api/telemetry/collect` endpoint
- Events include: usage patterns, feature interactions, user email, app version
- Sent via HTTP POST or WebSocket depending on auth state

**File involved:**
- `packages/common/nbstore/src/telemetry/manager.ts` - Actual sending logic (lines 146-229)
- `packages/frontend/track/src/telemetry.ts` - Telemetry transport setup
- `packages/frontend/core/src/modules/telemetry/services/telemetry.ts` - Context management

### 2. Sentry Error Reporting
**Files:**
- `packages/frontend/track/src/sentry.ts`
- `packages/frontend/apps/electron/src/main/index.ts`

**Configuration:**
- Initialized with `BUILD_CONFIG.SENTRY_DSN` from environment variable
- Reports JavaScript errors and performance issues to Sentry servers

### 3. Update Checking (Electron only)
**Related files:**
- `packages/frontend/apps/electron/src/main/index.ts`
- Various electron-updater configurations

---

## How to Isolate AFFiNE

### Option A: Disable Telemetry & Sentry (Recommended for Privacy)

#### 1. Disable Telemetry
Edit `packages/frontend/core/src/modules/cloud/constant.ts`:

```typescript
// Replace getOfficialTelemetryEndpoint function to return null/empty
export function getOfficialTelemetryEndpoint(
  channel = BUILD_CONFIG.appBuildType
): string {
  // Return empty string to disable telemetry
  return '';
}
```

This will cause telemetry to fail gracefully (line 93-100 in manager.ts checks for empty endpoint).

#### 2. Disable Sentry
Set environment variable during build:
```bash
export SENTRY_DSN=""
npm run build
```

Or edit `tools/utils/src/build-config.ts`:
```typescript
SENTRY_DSN: process.env.SENTRY_DSN ?? '', // Already defaults to empty
```

#### 3. Disable Telemetry at Runtime (Frontend)
Edit `packages/frontend/core/src/bootstrap/telemetry.ts`:

```typescript
import { sentry, tracker } from '@affine/track';
import { APP_SETTINGS_STORAGE_KEY } from '@toeverything/infra/atom';

tracker.init();
sentry.init();

if (typeof localStorage !== 'undefined') {
  // ALWAYS disable telemetry and sentry
  sentry.disable();
  tracker.opt_out_tracking();
}
```

#### 4. Disable Update Checking (Electron)
Edit `packages/frontend/apps/electron/src/main/index.ts`:

Find the updater initialization and remove/comment out:
```typescript
// Remove or comment out auto-updater setup
// autoUpdater.checkForUpdatesAndNotify();
```

### Option B: Route Through Your Own Server (Self-Contained)

If you want to keep functionality but own the data:

1. **Set up telemetry receiver** on your server:
   - Create endpoint `/api/telemetry/collect`
   - Accept POST requests with telemetry events
   - Store locally instead of sending to AFFiNE

2. **Modify telemetry endpoint:**
   Edit `packages/frontend/core/src/modules/cloud/constant.ts`:
   ```typescript
   const OFFICIAL_TELEMETRY_ENDPOINTS: Record<TelemetryChannel, string> = {
     stable: 'https://your-domain.com',  // Your own server
     beta: 'https://your-domain.com',
     internal: 'https://your-domain.com',
     canary: 'https://your-domain.com',
     local: 'http://localhost:8080',
   };
   ```

3. **For Sentry:** Set up your own Sentry instance or similar error tracking

---

## Verification Steps

After making changes, verify no external connections:

### 1. Check Network Requests
- Open browser DevTools (F12) → Network tab
- Use the app normally
- Should see NO requests to:
  - `app.affine.pro`
  - `insider.affine.pro`
  - `affine.fail`
  - Sentry endpoints (sentry.io)

### 2. Check WebSocket Connections
- In DevTools → Network → WS (WebSocket filter)
- Should see NO connections to affine.pro domains

### 3. Monitor DNS/Network Traffic (Advanced)
```bash
# Monitor all network traffic
sudo tcpdump -i any 'host app.affine.pro or host insider.affine.pro or host sentry.io'
```

---

## Build Instructions

After modifications:

```bash
# Clean build
npm run clean
npm run build

# For web version
npm run build:web

# For Electron
npm run build:electron

# Set empty Sentry DSN
export SENTRY_DSN=""
npm run build
```

---

## Summary of Key Files to Modify

| File | Change | Purpose |
|------|--------|---------|
| `packages/frontend/core/src/modules/cloud/constant.ts` | Change `getOfficialTelemetryEndpoint()` | Disable/redirect telemetry |
| `packages/frontend/core/src/bootstrap/telemetry.ts` | Force disable tracker and sentry | Disable telemetry at runtime |
| `packages/frontend/apps/electron/src/main/index.ts` | Remove auto-updater calls | Disable update checking |
| Build environment | Set `SENTRY_DSN=""` | Disable Sentry |

---

## Testing Checklist

- [ ] No external network requests detected
- [ ] Telemetry setting in UI respected (disabled by default)
- [ ] Sentry errors not reported
- [ ] Electron doesn't check for updates
- [ ] App functions normally locally
- [ ] Sync works with self-hosted server only

