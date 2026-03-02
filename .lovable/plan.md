

# Influencer Affiliate/Referral System - Implementation Plan

## Overview
Build a complete influencer referral system with promo codes, tiered commissions in PKR, referral tracking, marketing assets, and payout management. The system integrates directly with the existing Firebase/Firestore backend.

---

## Firestore Collections (New)

### `influencers` collection
```text
{
  userId: string (ref to auth user),
  promoCode: string (unique, e.g. "ALI10"),
  referralSlug: string (unique, e.g. "ali"),
  status: "pending" | "approved" | "rejected",
  customCommission: number | null (admin override %),
  totalClicks: number,
  totalSignups: number,
  totalReferredDeposits: number (PKR),
  totalCommissionEarned: number (PKR),
  commissionBalance: number (PKR, withdrawable),
  monthlyDeposits: number (PKR, resets monthly),
  currentTier: 1 | 2 | 3,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `referral_tracking` collection
```text
{
  referredUserId: string,
  influencerId: string,
  promoCode: string,
  type: "signup" | "deposit",
  depositAmount: number (PKR),
  userBonus: number (PKR),
  influencerCommission: number (PKR),
  commissionPercent: number,
  createdAt: timestamp
}
```

### `influencer_payouts` collection
```text
{
  influencerId: string,
  userId: string,
  amount: number (PKR),
  type: "withdrawal" | "wallet_transfer",
  method: "crypto" | "bank" | "wallet",
  status: "pending" | "completed" | "rejected",
  details: string,
  createdAt: timestamp
}
```

### `marketing_assets` collection (admin-managed)
```text
{
  title: string,
  category: "banner" | "video_script" | "logo" | "feature_highlight",
  fileUrl: string,
  description: string,
  createdAt: timestamp
}
```

---

## Commission Tiers (PKR)

| Tier | Monthly Referred Deposits | Commission |
|------|--------------------------|------------|
| 1    | Up to Rs.28,000/month    | 10%        |
| 2    | Rs.28,001 - Rs.140,000   | 15%        |
| 3    | Above Rs.140,000         | 20%        |

User bonus on using promo code: **5% extra balance** on deposit.

---

## New Pages & Routes

### User-Facing Pages
1. **`/influencer`** - Influencer Dashboard (apply or view stats)
2. **`/influencer/assets`** - Marketing Assets download page
3. **`/influencer/payouts`** - Commission payout/transfer page
4. **`/ref/:slug`** - Referral landing redirect (stores slug in localStorage, redirects to /signup)

### Admin Pages
5. **`/admin/influencers`** - Manage influencer applications, set custom rates, add test balance
6. **`/admin/marketing-assets`** - Upload/manage marketing materials

---

## Files to Create

### 1. `src/pages/user/Influencer.tsx` - Influencer Dashboard
- Apply to become influencer (form with desired promo code)
- If approved: show analytics cards (Clicks, Signups, Deposits, Commission, Current Tier)
- Progress bar showing tier advancement
- Referral link with copy button
- Promo code display with copy button
- Recent referral activity table
- Quick actions: View Assets, Request Payout, Transfer to Wallet

### 2. `src/pages/user/InfluencerAssets.tsx` - Marketing Hub
- Grid of downloadable assets (banners, scripts, logos)
- Category filter tabs
- Download button for each asset

### 3. `src/pages/user/InfluencerPayouts.tsx` - Payout Management
- Commission balance card
- Two options: Request Withdrawal (Crypto/Bank) or Transfer to Panel Wallet
- Minimum threshold: Rs.5,000 for withdrawal
- Payout history table

### 4. `src/pages/ReferralRedirect.tsx` - Referral Link Handler
- Reads `/ref/:slug` param
- Stores `referralSlug` in localStorage
- Increments click count on influencer doc
- Redirects to `/signup`

### 5. `src/pages/admin/InfluencerManagement.tsx` - Admin Controls
- Table of all influencer applications (pending/approved/rejected)
- Approve/reject buttons
- Edit dialog: set custom commission %, add test balance
- View influencer stats
- Override tier for VIP influencers

### 6. `src/pages/admin/MarketingAssets.tsx` - Asset Management
- Upload assets (via ImgBB for images)
- CRUD table with title, category, URL
- Preview/delete buttons

---

## Files to Modify

### 7. `src/pages/Signup.tsx`
- On signup, check localStorage for `referralSlug`
- If found, look up influencer by slug, save `referredBy` field on user doc
- Record signup event in `referral_tracking`
- Clear localStorage

### 8. `src/pages/user/AddFunds.tsx`
- Add "Promo Code" input field in deposit form
- On deposit submission, validate promo code against `influencers` collection
- If valid: calculate 5% user bonus, store `promoCode` and `bonusAmount` on transaction
- When admin approves deposit (PaymentManagement), also credit bonus and commission

### 9. `src/pages/admin/PaymentManagement.tsx`
- On deposit approval, check if transaction has `promoCode`
- If yes: add 5% bonus to user balance, calculate influencer commission based on tier, credit to influencer's `commissionBalance`, create `referral_tracking` entry

### 10. `src/App.tsx`
- Add all new routes (influencer dashboard, assets, payouts, admin pages, referral redirect)

### 11. `src/components/layout/AppSidebar.tsx`
- Add "Referral Program" link in user sidebar menu
- Add "Influencers" and "Marketing Assets" in admin sidebar under a new "Affiliates" group

---

## Commission Calculation Logic (in PaymentManagement on approve)

```text
1. Admin approves deposit with promoCode
2. Look up influencer by promoCode
3. Calculate user bonus = deposit * 0.05 (5%)
4. Add bonus to user balance
5. Get influencer's tier (or custom commission if set)
6. Calculate commission = deposit * tierPercent
7. Add to influencer's commissionBalance and totalCommissionEarned
8. Update influencer's monthlyDeposits and recalculate tier
9. Create referral_tracking record
```

---

## Implementation Order

1. Create Firestore collections structure (handled on first write)
2. Create ReferralRedirect page + modify Signup for referral tracking
3. Create Influencer Dashboard page with application flow
4. Modify AddFunds to accept promo codes
5. Modify PaymentManagement to process dual-benefit on approval
6. Create Admin InfluencerManagement page
7. Create Marketing Assets pages (admin + user)
8. Create Influencer Payouts page
9. Update App.tsx routes and Sidebar navigation
10. Test end-to-end flow

