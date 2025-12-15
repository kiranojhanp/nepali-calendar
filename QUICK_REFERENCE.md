# Quick Reference: Day Details Modal

## 🎯 How to Open

**Long Press** any calendar day for **500ms**

-   Desktop: Click and hold
-   Mobile: Tap and hold

## 📊 Information Shown

### 📅 Date Information

-   Nepali Date (BS) with day name
-   Gregorian Date (AD)
-   Month and Year in Devanagari

### 🕉️ Panchanga (Astrological)

| Detail        | Nepali      | Description                   |
| ------------- | ----------- | ----------------------------- |
| Tithi         | तारिख       | Lunar day with end time       |
| Paksha        | पक्ष        | Lunar fortnight (bright/dark) |
| Chandra Rashi | चन्द्र राशि | Moon zodiac sign              |
| Surya Rashi   | सूर्य राशि  | Sun zodiac sign               |
| Nakshatra     | नक्षत्र     | Lunar mansion                 |
| Yoga          | योग         | Auspicious combination        |
| Karan         | करण         | Half-tithi                    |
| Ritu          | ऋतु         | Season                        |

### ☀️ Astronomical Times

-   🌅 Sunrise
-   🌇 Sunset
-   🌙 Moonrise
-   🌑 Moonset

### 📜 Additional Calendars

-   Sak Sambat (शक संवत्)
-   Nepal Sambat (नेपाल संवत्)

### 🎉 Events & Holidays

-   Public holidays (red border)
-   Cultural events (blue border)
-   Religious observances

## 💡 Tips

### Visual Feedback

-   Day cell pulses when pressed
-   Changes to accent color during press
-   Modal opens with smooth animation

### Navigation

-   Click **X** or press **Escape** to close
-   Click outside modal to dismiss
-   Scroll for more information (if needed)

### Performance

-   First time: Fetches from API
-   Subsequent times: Uses cached data
-   Works offline after initial load

## 🎨 Appearance

### Theme Support

-   Automatically matches your Obsidian theme
-   Dark mode: Dark gradient header
-   Light mode: Light gradient header
-   Uses native Obsidian colors and fonts

### Layout

-   Responsive design (desktop & mobile)
-   2-column grid on wide screens
-   1-column on mobile (<600px)
-   Touch-friendly tap targets

## ⚡ Shortcuts

| Action       | Method                     |
| ------------ | -------------------------- |
| Open Details | Long press 500ms           |
| Quick Click  | < 500ms = Daily note       |
| Context Menu | Right click                |
| Close Modal  | Escape / X / Click outside |

## 🔗 Data Source

All panchanga data from: **https://data.miti.bikram.io**

Authentic and accurate Nepali calendar information maintained by the Miti team.

## 📱 Cross-Platform

✅ Windows
✅ macOS  
✅ Linux
✅ iOS (with Obsidian mobile)
✅ Android (with Obsidian mobile)

---

**Need help?** See [DAY_DETAILS_GUIDE.md](DAY_DETAILS_GUIDE.md) for detailed documentation.
