# Nepali Calendar Plugin for Obsidian

A calendar plugin for [Obsidian](https://obsidian.md/) that displays and manages daily notes using the Nepali calendar (Bikram Sambat - BS) system.

![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-purple)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

The Nepali Calendar plugin brings the Bikram Sambat (BS) calendar system to Obsidian, enabling users to create and manage daily notes based on Nepali dates. Perfect for Nepali-speaking users or anyone working with the Bikram Sambat calendar system.

## Features

### 📅 Nepali Calendar View

-   Interactive calendar displaying Bikram Sambat (BS) dates
-   Dual display showing both Nepali and Gregorian month names
-   Clean, intuitive interface optimized for Obsidian's dark theme

### 📝 Daily Notes Integration

-   Create daily notes based on Nepali dates
-   Click any day to open or create a daily note
-   Automatic note content generation with both BS and Gregorian dates
-   Configurable date formats and folder locations
-   Optional confirmation before creating new notes

### 🎨 Visual Indicators

-   Highlighted today's date for quick reference
-   Dot indicators for days with existing notes
-   Active file highlighting
-   Adjustable word count threshold for visual feedback

### ⚡ Quick Navigation

-   Navigate between months with intuitive arrow buttons
-   Jump to today with a single click
-   Ctrl/Cmd + Click to open notes in a new pane
-   Ctrl/Cmd + Hover to preview notes without opening

### ⚙️ Customizable Settings

-   Configure daily note date format (YYYY-MM-DD, MMMM DD, etc.)
-   Set custom folder location for daily notes
-   Customize week start day (Sunday, Monday, etc.)
-   Toggle confirmation dialogs
-   Adjust visual indicator thresholds

## Installation

### From Obsidian Community Plugins

> **Note**: This plugin is currently pending review for the Obsidian Community Plugins directory.

Once approved:

1. Open **Settings** in Obsidian
2. Navigate to **Community Plugins** and disable Safe Mode if needed
3. Click **Browse** and search for "Nepali Calendar"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/kiranojhanp/nepali-calendar/releases) page
2. Extract `main.js`, `manifest.json`, and `styles.css` to:
    ```
    <your-vault>/.obsidian/plugins/nepali-calendar/
    ```
3. Reload Obsidian (Ctrl/Cmd + R)
4. Go to **Settings → Community Plugins** and enable "Nepali Calendar"

### Build from Source

```bash
git clone https://github.com/kiranojhanp/nepali-calendar.git
cd nepali-calendar
npm install
npm run build
```

The compiled files will be in the `dist/` folder.

## Usage

### Opening the Calendar

After enabling the plugin:

1. **Ribbon Icon**: Click the calendar icon (📅) in the left ribbon
2. **Command Palette** (Ctrl/Cmd + P): Search for "Open Nepali Calendar"
3. The calendar opens in the right sidebar by default

### Creating Daily Notes

Click on any day in the calendar:

-   If the note exists, it opens immediately
-   If the note doesn't exist, a confirmation dialog appears (if enabled)
-   Click **Create** to generate a new daily note

**Default note content:**

```markdown
# Baisakh 15, 2081

**English Date:** Monday, April 28, 2024
```

### Navigation Shortcuts

| Action              | Method                      |
| ------------------- | --------------------------- |
| Previous/Next month | Click `‹` or `›` buttons    |
| Jump to today       | Click **Today** button      |
| Open in new pane    | Ctrl/Cmd + Click on a day   |
| Preview note        | Ctrl/Cmd + Hover over a day |

## Settings

Access settings via **Settings → Plugin Options → Nepali Calendar**

### Daily Note Format

Specify the filename format for daily notes. Default: `YYYY-MM-DD`

**Available format tokens:**

-   `YYYY` - 4-digit year (e.g., 2081)
-   `MM` - 2-digit month with leading zero (e.g., 01)
-   `DD` - 2-digit day with leading zero (e.g., 15)
-   `MMMM` - Full month name (e.g., Baisakh)
-   `M` - Month number without leading zero (e.g., 1)

**Examples:**

-   `YYYY-MM-DD` → `2081-01-15.md`
-   `YYYY/MM/DD` → `2081/01/15.md`
-   `MMMM DD, YYYY` → `Baisakh 15, 2081.md`

### Daily Note Folder

Specify where daily notes should be created. Leave empty to create in vault root.

Example: `Daily Notes/Nepali`

### Confirm Before Creating

Toggle the confirmation dialog that appears before creating new daily notes. Useful to prevent accidental note creation.

### Week Start Day

Choose which day starts the week in the calendar view (Sunday, Monday, etc.).

### Word Count Threshold

Set the minimum word count for a note to show visual indicators (dots). Default: 250 words.

## Nepali Calendar (Bikram Sambat)

The Bikram Sambat (BS) calendar is the official calendar of Nepal.

### Key Characteristics

-   **Year Offset**: BS year is approximately 56-57 years ahead of Gregorian year
-   **Months**: 12 months with varying lengths (29-32 days)
-   **New Year**: Typically starts in mid-April (Baisakh 1)
-   **Current Support**: BS years 2075-2082 (2018-2025 AD)

### Month Names

| Nepali Name | Typical Days | Approximate Gregorian Period |
| ----------- | ------------ | ---------------------------- |
| Baisakh     | 30-31        | Mid-April to Mid-May         |
| Jestha      | 31-32        | Mid-May to Mid-June          |
| Ashadh      | 31-32        | Mid-June to Mid-July         |
| Shrawan     | 31-32        | Mid-July to Mid-August       |
| Bhadra      | 31-32        | Mid-August to Mid-September  |
| Ashwin      | 30-31        | Mid-September to Mid-October |
| Kartik      | 29-30        | Mid-October to Mid-November  |
| Mangsir     | 29-30        | Mid-November to Mid-December |
| Poush       | 29-30        | Mid-December to Mid-January  |
| Magh        | 29-30        | Mid-January to Mid-February  |
| Falgun      | 29-30        | Mid-February to Mid-March    |
| Chaitra     | 30-31        | Mid-March to Mid-April       |

## Commands

Available via Command Palette (Ctrl/Cmd + P):

-   **Open Nepali Calendar** - Opens or reveals the calendar view
-   **Open Weekly Note** - Creates or opens the current week's note (if weekly notes enabled)
-   **Reveal active note** - Navigates the calendar to show the currently active note's date

## Development

### Prerequisites

-   Node.js v16 or higher
-   npm

### Setup

```bash
# Clone the repository
git clone https://github.com/kiranojhanp/nepali-calendar.git
cd nepali-calendar

# Install dependencies
npm install
```

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Production build with minification
npm run build:prod
```

The `build:prod` script creates optimized, minified output for distribution.

### Project Structure

```
nepali-calendar/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── view.ts              # Calendar view component
│   ├── settings.ts          # Settings tab and configuration
│   ├── constants.ts         # Constants and config
│   ├── ui/
│   │   ├── Calendar.svelte  # Main calendar UI component
│   │   ├── stores.ts        # Svelte stores for state management
│   │   ├── utils.ts         # UI utility functions
│   │   ├── modal.ts         # Confirmation modal
│   │   └── sources/         # Data sources (tasks, tags, etc.)
│   ├── io/
│   │   ├── dailyNotes.ts    # Daily note operations
│   │   └── weeklyNotes.ts   # Weekly note operations
│   └── utils/
│       ├── nepaliDate.ts    # BS/AD date conversion
│       ├── bikramSambat.ts  # BS calendar data
│       ├── mahina.ts        # Month utilities
│       └── calendarHelpers.ts
├── styles.css               # Plugin styles
├── manifest.json            # Plugin manifest
└── rollup.config.js         # Build configuration
```

### Testing

Test the plugin by copying the build output to your test vault:

```bash
# After building
cp dist/* <your-vault>/.obsidian/plugins/nepali-calendar/
```

Then reload Obsidian (Ctrl/Cmd + R) and enable the plugin.

## Compatibility

-   **Minimum Obsidian version**: 0.15.0
-   **Platforms**: Desktop (Windows, macOS, Linux) and Mobile (iOS, Android)
-   **Dependencies**: Works standalone; enhanced with Daily Notes or Periodic Notes plugins

## Known Limitations

-   Calendar data is currently available for BS years 2075-2082 (2018-2025 AD)
-   Date conversions may have minor variations (±1 day) due to the nature of the BS calendar system
-   Weekly notes require the Periodic Notes plugin for full functionality

## Roadmap

Future enhancements under consideration:

-   [ ] Extended date range (additional BS years)
-   [ ] Template support for daily notes
-   [ ] Nepali language localization
-   [ ] Festival and holiday markers
-   [ ] Custom CSS variables for easier theming
-   [ ] Export calendar data
-   [ ] Integration with other calendar plugins

## Support

### Getting Help

-   Check existing [Issues](https://github.com/kiranojhanp/nepali-calendar/issues)
-   Create a new issue with:
-   Your Obsidian version
-   Plugin version
-   Steps to reproduce
-   Expected vs actual behavior

### Feature Requests

Feature requests are welcome! Please open an issue with:

-   Clear description of the feature
-   Use case and benefits
-   Any relevant examples

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure:

-   Code follows the existing style
-   Changes are well-tested
-   Commit messages are clear and descriptive

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Inspired by the excellent [obsidian-calendar-plugin](https://github.com/liamcain/obsidian-calendar-plugin)
-   Nepali calendar data and conversion algorithms based on official BS calendar standards
-   Built with the [Obsidian API](https://github.com/obsidianmd/obsidian-api)
-   Uses [bikram-sambat](https://github.com/prajwol-gautam/bikram-sambat) library for date conversions

## Disclaimer

This plugin is not affiliated with or endorsed by Obsidian.md or the Government of Nepal. The Bikram Sambat calendar conversions are provided as-is. For critical applications, please verify dates independently.

---

**Developed with ❤️ by [kiranojhanp](https://github.com/kiranojhanp)**
