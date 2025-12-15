# Calendar API Integration

## Overview

This plugin now uses the **miti.bikram.io API** for accurate Nepali calendar data instead of manual calculations. The implementation includes offline support through intelligent caching.

## Architecture

### API Client (`src/api/calendar.ts`)

The API client provides:

-   **Fetch calendar data** from `https://data.miti.bikram.io/data/{year}/{month}.json`
-   **Dual-layer caching**:
    -   In-memory cache for fast repeated access within the same session
    -   localStorage cache for offline persistence (30-day duration)
-   **Preloading** capabilities to fetch adjacent months in parallel

### Offline Support

The plugin works seamlessly offline by:

1. **On first use (online)**: Fetches calendar data from API and caches it
2. **On subsequent use (offline)**:
    - Serves data from localStorage cache if available
    - Falls back to the `bikram-sambat` library if cache misses
3. **Preloading strategy**:
    - On plugin load: preloads 2 months before and 3 months after current month
    - On month navigation: preloads 1 month before and 2 months after displayed month

This ensures smooth user experience even without internet connectivity.

### Data Flow

```
User Opens Calendar
       ↓
View.onOpen() → Preload current + surrounding months
       ↓
Calendar.svelte → Generates calendar days
       ↓
generateCalendarDays() → Uses bikramSambat.ts functions
       ↓
bikramSambat.ts → Checks cache → API (if needed) → Fallback library
```

### Key Functions

#### API Layer (`src/api/calendar.ts`)

-   `getCalendarData(year, month)` - Fetch/retrieve calendar data
-   `preloadCalendarData(year, month, before, after)` - Preload range of months
-   `clearCalendarCache()` - Clear all cached data
-   `getCacheStats()` - View cache statistics

#### Date Utilities (`src/utils/bikramSambat.ts`)

-   `preloadMonthData(year, month)` - Preload specific month
-   `gregorianToNepali(date)` - Convert dates (uses cache + fallback)
-   `nepaliToGregorian(nepaliDate)` - Convert dates (uses cache + fallback)
-   `getDaysInNepaliMonth(year, month)` - Get month length

All functions are **synchronous** for seamless UI integration, with automatic fallback to the `bikram-sambat` library when cache is unavailable.

## Benefits

✅ **Accurate Data**: Uses authoritative miti.bikram.io data source
✅ **Offline Ready**: Works without internet after initial data load  
✅ **Fast Performance**: Dual-layer caching minimizes network requests
✅ **Graceful Degradation**: Falls back to library when API unavailable
✅ **Smart Preloading**: Anticipates user navigation patterns

## Cache Management

Cache is stored in localStorage with keys like:

```
nepali-calendar-2081-09  (year-month)
```

Each cached entry includes:

-   Full month data (all days with Gregorian mappings)
-   Timestamp for expiration checking (30-day TTL)

To manually clear cache:

```javascript
import { clearCalendarCache } from "src/api/calendar";
clearCalendarCache();
```

## API Data Structure

Example response from `https://data.miti.bikram.io/data/2081/09.json`:

```json
{
  "year": 2081,
  "month": 9,
  "totalDays": 30,
  "days": [
    {
      "year": 2081,
      "month": 9,
      "day": 1,
      "weekDay": 5,
      "ad": "2024-12-13",
      "tithi": "...",
      "holiday": "...",
      "event": "..."
    },
    ...
  ]
}
```

## Comparison with Manual Calculation

### Before (Manual)

-   ❌ Hardcoded data arrays in `nepaliDate.ts`
-   ❌ Limited year range
-   ❌ Potential accuracy issues
-   ❌ Large bundle size with all data

### After (API-based)

-   ✅ Dynamic data from authoritative source
-   ✅ Unlimited year range
-   ✅ Always up-to-date
-   ✅ Smaller bundle, data loaded on-demand
-   ✅ Offline capable with caching

## Migration Notes

The following changes were made:

1. **Removed**: `src/utils/nepaliDate.ts` (hardcoded data)
2. **Added**: `src/api/calendar.ts` (API client with caching)
3. **Updated**: `src/utils/bikramSambat.ts` (now uses cache + API)
4. **Updated**: `src/view.ts` (preloads data on open)
5. **Updated**: `src/ui/Calendar.svelte` (preloads on month change)

The `bikram-sambat` library is still used as a fallback for offline scenarios when cache is unavailable.
