

## Problem

Login history entries are not being saved to the `login_history` subcollection. The `saveLoginHistory` function silently swallows all errors (`catch {}` on line 56-57), making it impossible to diagnose failures. The main user doc fields (lastIP, lastCity etc.) may update while the subcollection write silently fails.

Additionally, the session deduplication logic using `Date.now().toString().slice(0, -4)` creates a key that changes every ~10 seconds, which can cause `onAuthStateChanged` to skip saving if it fires within the same window on rapid re-renders.

## Plan

**File: `src/contexts/AuthContext.tsx`**

1. **Add error logging to `saveLoginHistory`** — Replace the silent `catch {}` with `console.error` so failures are visible in the console.

2. **Fix session deduplication** — Change the `locKey` to use a stable session-based key (e.g., just `loc_saved_{uid}`) that only resets on actual login/logout, not on page refreshes. This ensures:
   - Fresh login → always saves history
   - Page refresh within same session → doesn't duplicate

3. **Add explicit logging** — Add `console.log` before and after the `saveLoginHistory` call so we can confirm the save path is being reached and completing.

4. **Ensure `saveLoginHistory` is awaited** — Currently it's fire-and-forget inside `.then()`. Make it properly awaited so errors surface.

### Technical Details

```
// saveLoginHistory - add error logging
catch (e) {
  console.error('[Auth] Failed to save login history:', e);
}

// Fix locKey to be session-stable (reset only on fresh login)
// In login/signup functions: sessionStorage.removeItem(`loc_saved_${uid}`)
// In onAuthStateChanged: use `loc_saved_${uid}` without timestamp
```

This way, every actual login triggers a fresh history save, and errors are no longer hidden.

