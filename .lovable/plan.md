

## Panel Enhancement Plan

### 1. User Account Self-Delete (Soft Delete) — `src/pages/user/Profile.tsx`

Add a "Delete Account" danger zone card at the bottom of Profile page:
- User clicks "Delete My Account" → AlertDialog confirmation with password re-authentication
- On confirm: sets `status: "deleted"` and `deletedAt: serverTimestamp()` on the user's Firestore doc, then signs out
- **No Firebase Auth deletion** — just Firestore status change (soft delete)
- In `ProtectedRoute.tsx`: add check for `status === "deleted"` → redirect to a "Account Deleted" page (reuse pattern from Banned page)
- Create `src/pages/AccountDeleted.tsx` — simple page saying "Your account has been deleted. Contact support if this was a mistake." with logout button
- In `AuthContext`: treat `deleted` status same as `banned` — block access

### 2. Password Reset (Forgot Password) — `src/pages/Login.tsx`

Add "Forgot password?" link below the password field on login page:
- Opens a Dialog/inline form asking for email
- Calls Firebase `sendPasswordResetEmail(auth, email)`
- Shows success toast: "Password reset email sent!"
- No new page needed — just a dialog on the login page

### 3. Admin Delete User — `src/pages/admin/UserManagement.tsx`

Add delete options to the edit user dialog:
- **Soft Delete** button: sets `status: "deleted"`, `deletedAt: serverTimestamp()` — user can't login but data preserved, admin can recover by setting status back to "active"
- **Hard Delete** button (with extra confirmation AlertDialog): deletes the Firestore doc entirely with `deleteDoc()`
- Add "deleted" status badge (gray) in user table
- Add "Recover" quick action for soft-deleted users (sets status back to "active", clears `deletedAt`)
- Update status Select to include "deleted" option

### 4. Favicon — `index.html` + SVG favicon

Generate an inline SVG favicon with "B" letter using the brand gradient (#7c3aed → #2563eb):
- Add `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` to `index.html`
- Create `public/favicon.svg` — a rounded square with gradient "B" letter
- Keep existing `.ico` as fallback

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/user/Profile.tsx` | Add danger zone card with delete account + AlertDialog |
| `src/pages/Login.tsx` | Add "Forgot password?" with reset email dialog |
| `src/pages/admin/UserManagement.tsx` | Add soft/hard delete buttons, recover action |
| `src/components/ProtectedRoute.tsx` | Block `deleted` status users → redirect |
| `src/pages/AccountDeleted.tsx` | New — simple deleted account page |
| `src/contexts/AuthContext.tsx` | Update UserProfile type to include `"deleted"` status |
| `src/App.tsx` | Add `/account-deleted` route |
| `index.html` | Update favicon link |
| `public/favicon.svg` | New — brand "B" SVG favicon |

