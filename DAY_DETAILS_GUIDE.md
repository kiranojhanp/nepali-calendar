# Day Details Feature Guide

## Overview

The Nepali Calendar plugin now includes a **Day Details Modal** that shows comprehensive panchanga information for any calendar day.

## How to Use

### Opening Day Details

There are **two ways** to view detailed information for a day:

1. **Long Press** (500ms) on any calendar day

    - On desktop: Click and hold for 500ms
    - On mobile: Tap and hold for 500ms

2. **Right Click** (alternative, opens file menu if note exists)
    - Right-click on any day to see the context menu

### What Information is Shown

The Day Details Modal displays:

#### 📅 Header

-   **Nepali Date** (BS) - Large display with day number and day name
-   **Gregorian Date** (AD) - Month, Day, Year
-   **Nepali Month & Year** - In Devanagari script

#### 🎉 Events & Holidays

-   Public holidays
-   Cultural events
-   Religious observances

#### 🕉️ Panchanga Details

-   **Tithi** (तारिख) - Lunar day with end time
-   **Paksha** (पक्ष) - Lunar fortnight (शुक्ल/कृष्ण)
-   **Chandra Rashi** (चन्द्र राशि) - Moon sign/zodiac
-   **Surya Rashi** (सूर्य राशि) - Sun sign/zodiac
-   **Nakshatra** (नक्षत्र) - Lunar mansion with end time
-   **Yoga** (योग) - Auspicious combination
-   **Karan** (करण) - Half of tithi
-   **Ritu** (ऋतु) - Season

#### ☀️ Sun & Moon Times

-   🌅 **Sunrise** - Time of sunrise
-   🌇 **Sunset** - Time of sunset
-   🌙 **Moonrise** - Time of moonrise (when applicable)
-   🌑 **Moonset** - Time of moonset (when applicable)

#### 📜 Other Eras

-   **Sak Sambat** - Saka era year
-   **Nepal Sambat** - Nepal Sambat year and month

## Technical Details

### Data Source

All panchanga data is fetched from **miti.bikram.io** API in real-time, ensuring accuracy and authenticity.

### API Endpoint

```
https://data.miti.bikram.io/data/{year}/{month}.json
```

Example: `https://data.miti.bikram.io/data/2081/08.json`

### Offline Support

-   Data is **not** cached for the modal (to ensure freshness)
-   If offline, the modal will show an error message
-   The calendar itself works offline (uses cached/fallback data)

### Design Language

The modal uses **Obsidian's design system**:

-   Native color variables (`--interactive-accent`, `--text-normal`, etc.)
-   Consistent spacing and typography
-   Responsive layout (mobile-friendly)
-   Dark/Light theme support (automatic)

## UI Components

### Modal Layout

```
┌──────────────────────────────────────┐
│  Day Details                      [×] │
├──────────────────────────────────────┤
│  ╔════════════════════════════╗      │
│  ║  १                          ║      │
│  ║  शनिवार                    ║      │
│  ║  November 16, 2024          ║      │
│  ║  मंसिर २०८१                ║      │
│  ╚════════════════════════════╝      │
│                                       │
│  📅 Events & Holidays                │
│  ┌─────────────────────────────────┐ │
│  │ Panga Baisnabi Devi Jaatraa   │ │
│  └─────────────────────────────────┘ │
│                                       │
│  🕉️ Panchanga                        │
│  ┌────────────┬────────────┐         │
│  │ तारिख:    │ नक्षत्र:   │         │
│  │ प्रतिपदा │ कृत्तिका  │         │
│  └────────────┴────────────┘         │
│  ...                                  │
└──────────────────────────────────────┘
```

### Color Scheme

-   **Header**: Gradient accent background
-   **Events**: Accent left border
-   **Holidays**: Red left border
-   **Panchanga Items**: Secondary background with hover effect
-   **Times**: Icon + value layout

## Developer Notes

### Files Added

-   `src/ui/DayDetailsModal.ts` - Modal component
-   Styles in `styles.css` - Modal styling

### Files Modified

-   `src/view.ts` - Added `onLongPressDay` handler
-   `src/ui/Calendar.svelte` - Added long press detection

### Long Press Implementation

```typescript
const LONG_PRESS_DURATION = 500; // milliseconds

// Start timer on mousedown/touchstart
on:mousedown={() => handleDayMouseDown(day)}

// Clear timer on mouseup/touchend
on:mouseup={handleDayMouseUp}

// Clear on mouse leave (drag away)
on:mouseleave={handleDayMouseUp}
```

### API Response Structure

```typescript
interface DayData {
  calendarInfo: {
    dates: { bs: {...}, ad: {...} }
    days: { dayOfWeek: {...} }
    nepaliEra: { sakSambat: {...}, nepalSambat: {...} }
  }
  tithiDetails: { title: {...}, endTime: {...} }
  panchangaDetails: {
    pakshya: {...}
    chandraRashi: {...}
    suryaRashi: {...}
    nakshatra: {...}
    yog: {...}
    karans: {...}
    season: {...}
    times: { sunrise, sunset, moonrise, moonset }
  }
  events?: Array<{...}>
  holidays?: Array<{...}>
}
```

## Future Enhancements

Potential improvements:

-   [ ] Add copy functionality for panchanga details
-   [ ] Show auspicious/inauspicious times
-   [ ] Add share button for social media
-   [ ] Bookmark favorite dates
-   [ ] Export day details as PDF/image
-   [ ] Add comparison with other calendar systems
-   [ ] Show planetary positions
-   [ ] Add lunar phase visualization

## Troubleshooting

### Modal Doesn't Open

-   Ensure you're holding for full 500ms
-   Try right-clicking instead
-   Check browser console for errors

### No Data Displayed

-   Check internet connection
-   Verify API is accessible: https://data.miti.bikram.io
-   Check browser console for network errors

### Styling Issues

-   Update Obsidian to latest version
-   Check for theme conflicts
-   Inspect CSS variables in DevTools

## Credits

-   **API**: miti.bikram.io
-   **Calendar System**: Bikram Sambat (विक्रम संवत्)
-   **Design**: Obsidian design system
