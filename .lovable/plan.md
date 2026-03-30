

## Problem Analysis

The current `api/client-ip.js` has two issues:

1. **Location data relies on Vercel-specific headers** (`x-vercel-ip-country`, `x-vercel-ip-city`) — these only work on Vercel's production edge network and return **country codes** (e.g., "US") not full names (e.g., "United States"). In Lovable preview, these headers don't exist at all, so location is always empty.

2. **IP is correct** (from `x-forwarded-for`) but location derived from Vercel headers is incomplete/missing.

## Solution

Update `api/client-ip.js` to:
1. Extract the real client IP from headers (this part works fine)
2. **Call a free geolocation API server-side** using that IP to get accurate city, region, country data
3. Use `ip-api.com` (free, no key needed, returns full country/city names) as primary, with `ipwho.is` as fallback
4. Fall back to Vercel headers only if both APIs fail

### Changes

**File: `api/client-ip.js`**
- Keep existing IP extraction from headers
- Add server-side `fetch` to `http://ip-api.com/json/{ip}?fields=country,regionName,city` using the extracted IP
- If that fails, try `https://ipwho.is/{ip}`
- Return accurate `{ ip, country, city, region }` with full names

This approach works in both Lovable preview AND Vercel production because the geolocation lookup happens server-side using the real client IP — no reliance on platform-specific headers for location.

No changes needed to `AuthContext.tsx` or `UserManagement.tsx` — only the API endpoint needs fixing.

