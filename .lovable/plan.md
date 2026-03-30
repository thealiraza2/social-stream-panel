

## Fix Landing Page Price Calculator — Use Real Prices from Firestore

The price calculator currently uses hardcoded dummy prices. We'll fetch actual service data from Firestore and show the **cheapest available rate** for each platform+service type combination.

### Approach

**File: `src/pages/LandingPage.tsx`**

1. **Fetch services & categories from Firestore** on mount (with sessionStorage caching like user Services page does)
2. **Map categories to platforms** by matching category name keywords (e.g., category name containing "instagram" → Instagram platform, "youtube" → YouTube, etc.)
3. **Map services to service types** by matching service name keywords (containing "follower" → Followers, "like" → Likes, "view" → Views, "comment" → Comments)
4. **Find the cheapest rate** for each platform+service type combination
5. **Build a dynamic `PRICE_MAP`** from this data, falling back to current hardcoded values if Firestore data is unavailable
6. **Update the calculator UI** to use the dynamic price map — show a subtle loading state while prices load

### Technical Details

- Use `getDocs(collection(db, "categories"))` and `getDocs(collection(db, "services"))` with the same caching pattern already used in `user/Services.tsx`
- Category-to-platform matching: check if `category.name.toLowerCase()` includes platform keyword
- Service-to-type matching: check if `service.name.toLowerCase()` includes type keyword (follower/like/view/comment)
- For each platform+type combo, take `Math.min(...matchingRates)` to show the cheapest option
- Keep current hardcoded `PRICE_MAP` as fallback default state
- Rates in Firestore are already "per 1000" format, matching the calculator's formula

