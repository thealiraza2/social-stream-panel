

# Mobile Responsiveness Fixes

After reviewing all user pages, the main issues are **wide tables** that overflow on mobile screens. The grid layouts (Dashboard stats, shortcuts, etc.) already use responsive classes (`sm:`, `lg:`) and work fine.

## Issues Found

### 1. Services Page — Table overflows (8 columns)
- Replace the table with a **card-based layout on mobile** (`hidden md:block` for table, `md:hidden` for cards)
- Each card shows: service name, category badge, rate, min/max, and Order button

### 2. Order Logs — Table overflows (8 columns)
- Same approach: **card layout on mobile**, table on desktop
- Each card shows: service name, status badge, charge, date, copy ID button

### 3. Dashboard — Recent Orders table overflows (6 columns)
- Use **card layout on mobile** for recent orders
- Show key info: service name, charge, status, date

### 4. Profile — Account overview grid slightly cramped
- The `grid-cols-2` on mobile is acceptable but "Member Since" date truncates
- Fix by using shorter date format on small screens

## Files to modify:
1. `src/pages/user/Services.tsx` — Add mobile card view
2. `src/pages/user/OrderLogs.tsx` — Add mobile card view
3. `src/pages/user/Dashboard.tsx` — Add mobile card view for recent orders
4. `src/pages/user/Profile.tsx` — Minor date format fix

