

## Fix: Price Calculator — Stop Animation & Fix Truncated Names

### Problems Found
1. **Line 508**: Platform names use `p.slice(0, 5)` which produces ugly truncations: "YouTu", "TikTo", "Twitt", "Teleg"
2. **Line 485**: The calculator card has `animate-float-slow` class making it float/move continuously — should be static

### Plan

**File: `src/pages/LandingPage.tsx`**

1. **Remove floating animation** (line 485): Remove `animate-float-slow` from the calculator wrapper div so it stays perfectly still.

2. **Fix platform name labels** (line 508): Replace `p.slice(0, 5)` with a proper short-name map:
   - Instagram → "Insta"
   - YouTube → "YouTube"  
   - TikTok → "TikTok"
   - Twitter → "Twitter"
   - Telegram → "Telegram"

   On small screens where space is tight, use sensible abbreviations that are still readable. Will adjust the grid to allow slightly more space per button so full names fit.

