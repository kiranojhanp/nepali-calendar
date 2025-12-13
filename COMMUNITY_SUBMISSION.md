# Community Plugin Submission Checklist

## Prerequisites (Must Complete Before Submission)

### 1. GitHub Release ⚠️ **REQUIRED - NOT YET DONE**

**Steps:**

```bash
# 1. Ensure you're on master and up to date
git checkout master
git pull

# 2. Build production version
npm run build:prod

# 3. Commit any final changes
git add .
git commit -m "Prepare for v1.0.0 release"
git push origin master

# 4. Create and push tag (MUST match manifest.json version exactly)
git tag 1.0.0
git push origin 1.0.0
```

**Then on GitHub:**

1. Go to: https://github.com/kiranojhanp/nepali-calendar/releases/new
2. **Tag:** `1.0.0` (select the tag you just pushed)
3. **Title:** `1.0.0` or `Nepali Calendar v1.0.0`
4. **Description:** Write release notes (see template below)
5. **Attach files:** Upload these 3 files from `dist/` folder:
    - `main.js`
    - `manifest.json`
    - `styles.css`
6. Click **Publish release**

**Release Notes Template:**

```markdown
# Nepali Calendar v1.0.0

First public release of the Nepali Calendar plugin for Obsidian.

## Features

-   📅 Interactive Bikram Sambat (BS) calendar view
-   📝 Daily notes integration with Nepali dates
-   🎨 Visual indicators for existing notes
-   ⚡ Quick navigation and keyboard shortcuts
-   ⚙️ Customizable date formats and settings
-   📱 Mobile and desktop compatible

## Supported Date Range

BS years 2075-2082 (2018-2025 AD)

## Installation

Install from Obsidian Community Plugins (search "Nepali Calendar") or manually from this release.

See [README](https://github.com/kiranojhanp/nepali-calendar) for full documentation.
```

### 2. Verify Release Files ⚠️ **CHECK AFTER RELEASE**

After creating the GitHub release, verify:

-   [ ] Release appears at: https://github.com/kiranojhanp/nepali-calendar/releases
-   [ ] Tag is exactly `1.0.0` (no 'v' prefix)
-   [ ] All 3 files are attached: `main.js`, `manifest.json`, `styles.css`
-   [ ] Files download correctly

### 3. Repository Checks ✅ **ALREADY COMPLETE**

-   [x] Public GitHub repository
-   [x] Valid LICENSE file (MIT/ISC compatible)
-   [x] Comprehensive README.md
-   [x] No sensitive data in code
-   [x] No telemetry or tracking
-   [x] manifest.json contains all required fields
-   [x] versions.json maps plugin versions to Obsidian versions

### 4. Code Quality Checks ✅ **ALREADY COMPLETE**

-   [x] No console.log or debug statements
-   [x] No hardcoded file paths
-   [x] Proper error handling
-   [x] Clean TypeScript compilation
-   [x] Minified production build

## Submission Process

### Step 1: Fork obsidian-releases

```bash
# Go to: https://github.com/obsidianmd/obsidian-releases
# Click "Fork" button

# Clone your fork
cd ~/development
git clone https://github.com/kiranojhanp/obsidian-releases.git
cd obsidian-releases
```

### Step 2: Create Plugin Entry

Edit `community-plugins.json` and add to the END of the list:

```json
{
	"id": "nepali-calendar",
	"name": "Nepali Calendar",
	"author": "kiranojhanp",
	"description": "A calendar plugin for visualizing and navigating Nepali (Bikram Sambat) dates with daily notes integration.",
	"repo": "kiranojhanp/nepali-calendar"
}
```

**Important:**

-   Add to the END of the file
-   Ensure valid JSON (no trailing comma on last item)
-   `id` must match the `id` in your manifest.json
-   `repo` format: `username/repo-name` (no https://)

### Step 3: Commit and Push

```bash
git checkout -b add-nepali-calendar
git add community-plugins.json
git commit -m "Add Nepali Calendar plugin"
git push origin add-nepali-calendar
```

### Step 4: Create Pull Request

1. Go to: https://github.com/obsidianmd/obsidian-releases/pulls
2. Click "New Pull Request"
3. Click "compare across forks"
4. Set base: `obsidianmd/obsidian-releases` `master`
5. Set head: `kiranojhanp/obsidian-releases` `add-nepali-calendar`
6. Click "Create Pull Request"

**PR Title:** `Add Nepali Calendar plugin`

**PR Description:**

```markdown
# Plugin Submission: Nepali Calendar

## Plugin Information

-   **Name:** Nepali Calendar
-   **ID:** nepali-calendar
-   **Repository:** https://github.com/kiranojhanp/nepali-calendar
-   **Initial Release:** 1.0.0

## Description

A calendar plugin for Obsidian that displays and manages daily notes using the Nepali calendar (Bikram Sambat - BS) system. Features include interactive calendar view, daily notes integration, visual indicators, and customizable date formats.

## Checklist

-   [x] I have read and agree to the Developer Policies
-   [x] I have read the Plugin Guidelines
-   [x] My plugin follows the submission requirements
-   [x] I have created a GitHub release (v1.0.0)
-   [x] I have attached main.js, manifest.json, and styles.css to the release
-   [x] My plugin has a comprehensive README
-   [x] My plugin has a valid LICENSE
-   [x] My plugin does not contain telemetry or tracking

## CLA Agreement

I have read the CLA agreement and I hereby sign the CLA
```

### Step 5: Wait for Review

-   Obsidian team will review your submission (typically 1-4 weeks)
-   They may request changes - respond promptly
-   Monitor your PR for comments and feedback
-   Be patient and professional

## Post-Approval

Once approved and merged:

### 1. Announce Your Plugin

**Obsidian Forum:**

-   Post in: https://forum.obsidian.md/c/share-showcase/9
-   Title: `[Plugin] Nepali Calendar - Bikram Sambat calendar with daily notes`
-   Include screenshots and feature description

**Discord:**

-   Get `developer` role: https://discord.com/channels/686053708261228577/702717892533157999/830492034807758859
-   Announce in `#updates` channel

### 2. Monitor Issues

-   Watch for bug reports on GitHub
-   Respond to user questions
-   Plan future updates

### 3. Future Releases

For subsequent versions:

1. Update version in `manifest.json`
2. Run `npm run version`
3. Build with `npm run build:prod`
4. Commit and push
5. Create new tag and GitHub release
6. No need to PR to obsidian-releases again (automatic)

## Common Rejection Reasons (Avoid These)

-   ❌ No GitHub release or missing files
-   ❌ Release tag doesn't match manifest.json version
-   ❌ Using 'v' prefix in tags (use `1.0.0`, not `v1.0.0`)
-   ❌ Missing or incomplete README
-   ❌ No LICENSE file
-   ❌ Console.log statements in code
-   ❌ Telemetry without explicit user consent
-   ❌ Network requests without disclosure
-   ❌ Plagiarized code or theme
-   ❌ Invalid JSON in community-plugins.json

## Helpful Resources

-   Plugin Guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
-   Submit Plugin Docs: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
-   Developer Policies: https://docs.obsidian.md/Developer+policies
-   Sample Plugin: https://github.com/obsidianmd/obsidian-sample-plugin

## Status Tracking

-   [ ] GitHub release created (v1.0.0)
-   [ ] Release files verified
-   [ ] Fork obsidian-releases
-   [ ] Add entry to community-plugins.json
-   [ ] Create pull request
-   [ ] Sign CLA in PR comments
-   [ ] Address review feedback
-   [ ] PR approved and merged
-   [ ] Plugin appears in Obsidian
-   [ ] Announce on forum/Discord

---

**Current Status:** Ready to create GitHub release (Step 1)
**Next Action:** Create v1.0.0 GitHub release with attached files
