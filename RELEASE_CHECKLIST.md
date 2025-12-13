# Release Checklist

This checklist ensures a smooth release process for the Nepali Calendar plugin.

## Pre-Release Checks

-   [x] All code is production-ready and tested
-   [x] No console.log or debug statements in production code
-   [x] All TODOs and FIXMEs resolved
-   [x] README.md is comprehensive and accurate
-   [x] manifest.json version matches package.json version
-   [x] No TypeScript compilation errors
-   [x] Production build succeeds (`npm run build:prod`)

## Build Artifacts

Ensure the following files are present in `dist/` after running `npm run build:prod`:

-   [ ] `main.js` (minified, ~32KB)
-   [ ] `manifest.json` (copied from root)
-   [ ] `styles.css` (minified, ~4.5KB)

## GitHub Release Process

1. **Update Version**

    ```bash
    # Update version in manifest.json and package.json to match
    # Current version: 1.0.0
    npm run version
    ```

2. **Commit Changes**

    ```bash
    git add .
    git commit -m "Release v1.0.0"
    git push origin master
    ```

3. **Create Git Tag**

    ```bash
    # Tag must match manifest.json version exactly (no 'v' prefix)
    git tag 1.0.0
    git push origin 1.0.0
    ```

4. **Create GitHub Release**
    - Go to: https://github.com/kiranojhanp/nepali-calendar/releases/new
    - Tag: `1.0.0`
    - Title: `Nepali Calendar v1.0.0`
    - Description: Include release notes (features, fixes, improvements)
    - Attach these files as release assets:
        - `dist/main.js`
        - `dist/manifest.json`
        - `dist/styles.css`

## Community Plugin Submission

After the initial GitHub release:

1. **Fork the Community Plugins Repo**

    ```bash
    git clone https://github.com/obsidianmd/obsidian-releases.git
    cd obsidian-releases
    ```

2. **Add Plugin to community-plugins.json**

    ```json
    {
    	"id": "nepali-calendar",
    	"name": "Nepali Calendar",
    	"author": "kiranojhanp",
    	"description": "A calendar plugin for visualizing and navigating Nepali (Bikram Sambat) dates with daily notes integration.",
    	"repo": "kiranojhanp/nepali-calendar"
    }
    ```

3. **Create Pull Request**
    - Title: "Add Nepali Calendar plugin"
    - Include plugin description and features
    - Wait for review from Obsidian team

## Post-Release

-   [ ] Announcement on Obsidian forum/Discord
-   [ ] Monitor GitHub issues for bug reports
-   [ ] Update documentation based on user feedback

## Version Bump (for future releases)

When preparing a new version:

```bash
# 1. Update manifest.json version
# 2. Run version bump script
npm run version

# 3. Build production version
npm run build:prod

# 4. Follow GitHub Release Process above
```

## Notes

-   **Always use semantic versioning** (MAJOR.MINOR.PATCH)
-   **Never change the plugin ID** (`nepali-calendar`) after first release
-   **Tag versions without 'v' prefix** (e.g., `1.0.0`, not `v1.0.0`)
-   **Test thoroughly** before each release
-   **Keep CHANGELOG.md updated** with version history

## Support

For release issues, contact:

-   GitHub: @kiranojhanp
-   Issues: https://github.com/kiranojhanp/nepali-calendar/issues
