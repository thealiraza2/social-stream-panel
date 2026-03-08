

## Dashboard Slow Load Fix — Fast First Paint

### Problem
When navigating to `/dashboard` or `/admin`, the user sees a **spinner for 3-5+ seconds** because of this sequential blocking chain:

1. `AuthProvider` → Firebase SDK init + `onAuthStateChanged` (network) → `fetchProfile` getDoc (network)
2. `ProtectedRoute` → `useMaintenanceMode` onSnapshot (network) — blocks until loaded
3. Only THEN does the dashboard component mount
4. Dashboard does its OWN data fetch (orders, transactions, etc.)
5. **recharts** (80KB+) is eagerly imported in both dashboards

That's **3 sequential network calls** before ANY UI renders — on mobile with slow connections this is brutal.

### Solution: Cache + Optimistic Rendering

#### 1. Cache auth profile in localStorage (`src/contexts/AuthContext.tsx`)
- On successful profile fetch, save to `localStorage` as `cached_profile`
- On mount, immediately set profile from cache (so `loading` can be false faster)
- Background-refresh the real profile from Firestore
- This eliminates the spinner wait for returning users

#### 2. Cache maintenance mode (`src/components/ProtectedRoute.tsx`)
- Cache the maintenance boolean in `sessionStorage`
- Initialize state from cache so `loaded` is `true` immediately
- Still subscribe via `onSnapshot` to get real-time updates
- This removes the second blocking network call

#### 3. Show dashboard skeleton instantly (`src/pages/user/Dashboard.tsx` + `src/pages/admin/Dashboard.tsx`)
- Show stat cards with skeleton placeholders immediately (no spinner)
- Data loads in background and fills in
- User sees the layout structure within milliseconds

#### 4. Lazy-load recharts (`src/pages/user/Dashboard.tsx` + `src/pages/admin/Dashboard.tsx`)
- The spending chart is below the fold — wrap it in `lazy()` + `Suspense`
- Saves ~80KB from the initial chunk parse

#### 5. Parallel data fetches (`src/pages/admin/Dashboard.tsx`)
- Admin dashboard fetches 5 collections sequentially with individual `getDocs` — already uses separate calls but they're in one async function. Ensure `Promise.all` is used (it already is implicitly since they're `await`ed separately — need to parallelize them).

### Files to Modify

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Cache profile in localStorage, load cached on mount |
| `src/components/ProtectedRoute.tsx` | Cache maintenance mode in sessionStorage |
| `src/pages/user/Dashboard.tsx` | Skeleton-first UI, lazy-load recharts |
| `src/pages/admin/Dashboard.tsx` | Skeleton-first UI, lazy-load recharts, parallelize fetches |

### Key Logic

**AuthContext — Cached profile for instant load:**
```tsx
// On mount: load cached profile immediately
const cached = localStorage.getItem("cached_profile");
const [profile, setProfile] = useState<UserProfile | null>(cached ? JSON.parse(cached) : null);
const [loading, setLoading] = useState(!cached); // if cached, not loading!

// On fetch: update cache
const fetchProfile = async (u: User) => {
  const snap = await getDoc(doc(db, "users", u.uid));
  if (snap.exists()) {
    const data = { uid: u.uid, ...snap.data() } as UserProfile;
    setProfile(data);
    localStorage.setItem("cached_profile", JSON.stringify(data));
    return data;
  }
  return null;
};
```

**ProtectedRoute — Cached maintenance:**
```tsx
const [maintenance, setMaintenance] = useState(() => {
  const cached = sessionStorage.getItem("maintenance_mode");
  return cached === "true";
});
const [loaded, setLoaded] = useState(() => sessionStorage.getItem("maintenance_mode") !== null);
```

**Admin Dashboard — Parallel fetches:**
```tsx
const [usersSnap, ordersSnap, txSnap, svcSnap, ticketSnap] = await Promise.all([
  getDocs(collection(db, "users")),
  getDocs(collection(db, "orders")),
  getDocs(collection(db, "transactions")),
  getDocs(collection(db, "services")),
  getDocs(collection(db, "tickets")),
]);
```

