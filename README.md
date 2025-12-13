# Nepali Calendar Plugin for Obsidian

A calendar plugin for [Obsidian](https://obsidian.md/) that displays and manages daily notes using the Nepali calendar (Bikram Sambat - BS) system.

![Nepali Calendar Plugin](https://img.shields.io/badge/Obsidian-Plugin-purple)

## Features

-   **Nepali Calendar View**: Display a calendar using the Bikram Sambat (BS) calendar system
-   **Daily Notes Integration**: Create and navigate daily notes based on Nepali dates
-   **Visual Indicators**:
    -   Highlight today's date
    -   Bold text and dot indicator for days that have notes
    -   Active file highlighting
-   **Quick Navigation**:
    -   Navigate between months with arrow buttons
    -   Jump to today with a single click (TODAY button)
    -   Click on any day to open or create a daily note
-   **Tooltips**:
    -   Hover over any day to see the Gregorian date in your custom format
    -   Descriptive tooltips on navigation buttons
-   **Keyboard Shortcuts**:
    -   Ctrl/Cmd + Click to open notes in a new pane
    -   Ctrl/Cmd + Hover to preview notes
-   **Customizable Settings**:
    -   Configure date format for daily notes
    -   Set custom folder location for daily notes
    -   Set custom template for daily notes
    -   Customize week start day (Sunday, Monday, etc.)
    -   Toggle confirmation before creating new notes
    -   Adjust word count threshold for visual indicators

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Settings in Obsidian
2. Navigate to Community Plugins
3. Search for "Nepali Calendar"
4. Click Install
5. Enable the plugin

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/kiranojhanp/nepali-calendar/releases) page
2. Extract the files to your vault's `.obsidian/plugins/nepali-calendar/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Usage

### Opening the Calendar

After enabling the plugin, you can open the calendar view in several ways:

1. **Ribbon Icon**: Click the calendar icon in the left ribbon
2. **Command Palette**: Search for "Nepali Calendar: Open calendar view"
3. **Automatic**: The calendar will open automatically in the right sidebar when you start Obsidian

### Creating Daily Notes

1. Click on any day in the calendar
2. If the note doesn't exist:
    - A confirmation dialog will appear (if enabled in settings)
    - Click "Create" to create a new daily note for that date
3. If the note exists, it will open immediately

### Navigation

-   **Previous/Next Month**: Click the `‹` and `›` buttons
-   **Today**: Click the "Today" button to jump to the current month
-   **Open in New Pane**: Hold Ctrl/Cmd while clicking a day to open the note in a new pane
-   **Preview Notes**: Hold Ctrl/Cmd while hovering over a day to preview the note

### Daily Note Format

Daily notes are created with the following default content:

```markdown
# Baisakh 15, 2081

**English Date:** Monday, April 28, 2024
```

## Settings

### Daily Note Format

Specify the date format for your daily note filenames. The default is `YYYY-MM-DD` which creates files like `2081-01-15.md`.

**Available format tokens:**

-   `YYYY` - 4-digit year (e.g., 2081)
-   `MM` - 2-digit month (e.g., 01)
-   `DD` - 2-digit day (e.g., 15)
-   `MMMM` - Full month name (e.g., Baisakh)
-   `M` - Month number without padding (e.g., 1)

### Daily Note Folder

Specify where daily notes should be created. Leave empty to create them in the vault root.

### Confirm Before Creating New Note

Enable/disable the confirmation dialog that appears before creating a new daily note.

### Show Nepali Month

Toggle the display of Nepali month names in the calendar header.

### Show English Month

Toggle the display of English (Gregorian) month names alongside Nepali month names.

## Nepali Calendar (Bikram Sambat) Information

The Bikram Sambat (BS) calendar is the official calendar of Nepal. Key features:

-   **Year Offset**: Nepali year is approximately 56-57 years ahead of the Gregorian year
-   **Months**: 12 months with varying days (29-32 days per month)
-   **New Year**: Typically starts in mid-April of the Gregorian calendar
-   **Month Names**: Baisakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra

### Supported Date Range

The plugin currently supports Nepali dates from:

-   **2080 BS** (April 14, 2023 AD) to **2090 BS** (approximately 2033 AD)

## Commands

The plugin adds the following commands to the Command Palette:

-   **Nepali Calendar: Open calendar view** - Opens or reveals the calendar view
-   **Nepali Calendar: Open today's daily note** - Opens or creates today's daily note

## Customization

### CSS Variables

You can customize the appearance of the calendar by adding custom CSS to your `obsidian.css` file or a CSS snippet:

```css
.nepali-calendar-container {
	/* Customize calendar container */
}

.calendar-day-today {
	/* Customize today's date appearance */
}

.calendar-day-has-note {
	/* Customize days with notes */
}
```

## Development

### Prerequisites

-   Node.js (v16 or higher)
-   npm

### Building from Source

```bash
# Clone the repository
git clone https://github.com/kiranojhanp/nepali-calendar.git
cd nepali-calendar

# Install dependencies
npm install

# Build the plugin
npm run build

# For development with auto-rebuild
npm run dev
```

### Production build (minified)

To produce a minified production build (smaller `dist/main.js`), run:

```bash
# macOS / Linux (zsh/bash)
npm run build:prod
# For Windows or cross-platform usage consider using `cross-env` to set NODE_ENV
```

Notes:

-   The `build:prod` script will also minify `styles.css` and place the result at `dist/styles.css` (uses `esbuild --minify`).

### Project Structure

```
nepali-calendar/
├── src/
│   ├── utils/
│   │   └── nepali-date.ts    # Nepali date conversion utilities
│   ├── view.ts                # Calendar view component
│   └── settings.ts            # Settings interface
├── main.ts                    # Plugin entry point
├── styles.css                 # Plugin styles
└── manifest.json              # Plugin manifest
```

## Compatibility

-   **Obsidian Version**: Requires Obsidian v0.15.0 or higher
-   **Platform**: Works on Desktop and Mobile

## Known Limitations

-   The Nepali calendar data is pre-defined for years 2080-2090 BS
-   Date conversions may have minor variations (±1 day) due to astronomical calculations

## Roadmap

-   [ ] Extended date range support (add more years)
-   [ ] Weekly notes support
-   [ ] Custom templates for daily notes
-   [ ] Import/export calendar events
-   [ ] Multi-language support (Nepali/English)
-   [ ] Integration with other Nepali date plugins

## Support

If you encounter any issues or have suggestions:

1. Check the [Issues](https://github.com/kiranojhanp/nepali-calendar/issues) page
2. Create a new issue with details about the problem
3. Include your Obsidian version and plugin version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

-   Inspired by [obsidian-calendar-plugin](https://github.com/liamcain/obsidian-calendar-plugin)
-   Nepali calendar conversion algorithms based on standard BS calendar data
-   Built with the [Obsidian API](https://github.com/obsidianmd/obsidian-api)

## Credits

Developed by [kiranojhanp](https://github.com/kiranojhanp)

---

**Note**: This plugin is not affiliated with or endorsed by Obsidian.md or the Nepali government. The Nepali calendar conversions are provided as-is and should be verified for critical applications.
