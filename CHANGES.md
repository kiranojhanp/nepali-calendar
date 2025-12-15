# Summary of Changes - API Integration

## Version 1.0.8 - Latest Features

### Holiday Highlighting ✨

-   **NEW**: Holiday dates are now highlighted in red on the calendar
-   Automatically fetches holiday information from the API
-   Toggle on/off via Settings → General Settings → "Highlight holidays"
-   Enabled by default for better visibility of important dates

### Day Details Modal Enhancements 🎨

-   **Icons8 Integration**: High-quality sunrise/sunset icons from icons8.com
-   **Lucide Icons**: Beautiful icons for Panchanga, Events, and Other Eras sections
-   **Fixed**: Close button now properly visible against gradient header
-   **Enhanced Data**: All available panchanga details now displayed including:
    -   End times for Tithi, Nakshatra, Yoga, and Karan
    -   English translations where available
    -   Event descriptions and holiday types
    -   Complete Nepali era information

### Technical Improvements 🔧

-   Proper TypeScript interfaces for API data
-   Removed debug console statements
-   Improved error handling with silent fallbacks
-   Better type safety throughout the codebase

## What Changed

The Nepali Calendar plugin has been refactored to use the **miti.bikram.io API** instead of manual date calculations, with comprehensive offline support.

## New Files

1. **`src/api/calendar.ts`** (210 lines)

    - API client for fetching calendar data
    - Dual-layer caching (memory + localStorage)
    - Preloading functionality
    - Cache management utilities

2. **`API_INTEGRATION.md`**
    - Documentation of the new architecture
    - Usage guide and benefits

## Modified Files

1. **`src/utils/bikramSambat.ts`**

    - Now uses cached API data with fallback to bikram-sambat library
    - Added `preloadMonthData()` function
    - All functions remain synchronous for UI compatibility
    - Smart caching layer before hitting API or fallback

2. **`src/view.ts`**

    - Added preloading on view open (2 months before, 3 months after)
    - Imports preloading functions
    - Handles errors gracefully

3. **`src/ui/Calendar.svelte`**
    - Added reactive preloading when month changes
    - Preloads 1 month before and 2 months after current view
    - Silent error handling (falls back to library)

## Deleted Files

1. **`src/utils/nepaliDate.ts`**
    - Removed hardcoded date data (no longer needed)

## How It Works

### Online Mode

1. User opens calendar
2. Plugin fetches data from API
3. Data cached in localStorage (30-day TTL)
4. Immediate access on subsequent uses

### Offline Mode

1. User opens calendar (no internet)
2. Plugin checks localStorage cache
3. If cached: uses cached data
4. If not cached: falls back to bikram-sambat library
5. Seamless user experience

### Preloading Strategy

-   **On Load**: Current month + 5 surrounding months
-   **On Navigation**: Adjacent months for smooth browsing
-   **Parallel Fetching**: Multiple months loaded simultaneously

## Benefits

| Aspect      | Before              | After             |
| ----------- | ------------------- | ----------------- |
| Data Source | Hardcoded arrays    | Live API          |
| Year Range  | Limited (2000-2090) | Unlimited         |
| Accuracy    | Static              | Always current    |
| Bundle Size | Large (all data)    | Small (on-demand) |
| Offline     | No                  | Yes (with cache)  |
| Updates     | Manual              | Automatic         |

## Technical Details

### Cache Structure

```
localStorage keys: nepali-calendar-{year}-{month}
Memory cache: Map<string, NepaliMonthData>
TTL: 30 days
```

### Fallback Chain

```
1. Memory Cache → 2. localStorage → 3. API → 4. bikram-sambat library
```

### API Endpoint

```
https://data.miti.bikram.io/data/{year}/{month}.json
```

## Testing

✅ Build successful (`npm run build`)  
✅ No TypeScript errors  
✅ All functions remain synchronous  
✅ Backward compatible (fallback library intact)

## Next Steps (Optional)

-   [ ] Add cache statistics to settings panel
-   [ ] Add manual cache clear button in settings
-   [ ] Add network status indicator
-   [ ] Preload entire year option in settings
-   [ ] Add cache size limits to prevent localStorage overflow

## Migration Impact

**For Users**:

-   Seamless upgrade, no action required
-   Better accuracy and performance
-   Works offline after first use

**For Developers**:

-   API is drop-in compatible with existing code
-   All function signatures unchanged
-   Enhanced with caching layer
