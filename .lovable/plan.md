

# Fix: Fully Automated Provider Order Routing

## The Problem

The proxy endpoint (`api/proxy-provider.ts`) is broken for order placement. It **hardcodes** `action: "services"` and ignores all other parameters sent from the frontend (like `action: "add"`, `service`, `link`, `quantity`). So when a user places an order, the proxy fetches the service list instead of placing the actual order with the provider.

## The Fix

Update `api/proxy-provider.ts` to be a **generic proxy** that forwards ALL parameters from the request body to the provider API as form data.

### Changes to `api/proxy-provider.ts`

Instead of hardcoding `action: "services"`, the proxy will:
1. Extract `apiUrl` and `apiKey` from the request body
2. Forward **all remaining fields** (`action`, `service`, `link`, `quantity`, etc.) as URL-encoded form data to the provider
3. This makes it work for ALL SMM panel API actions: `services`, `add`, `status`, `cancel`, `refill`, etc.

```text
Before (broken):
  formData.append("key", apiKey);
  formData.append("action", "services");  // <-- always "services"

After (fixed):
  formData.append("key", apiKey);
  // Forward all other fields dynamically
  for (const [key, value] of Object.entries(rest)) {
    formData.append(key, String(value));
  }
```

### Files Modified
1. **`api/proxy-provider.ts`** -- Make it a generic forwarder instead of hardcoded "services" only

### No Frontend Changes Needed
Both `NewOrder.tsx` and `BulkOrder.tsx` already send the correct parameters (`action: "add"`, `service`, `link`, `quantity`). Once the proxy forwards them properly, orders will automatically go to the provider API and come back with a `providerOrderId`.

