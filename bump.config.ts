import { defineConfig } from "bumpp";

export default defineConfig({
	// Files to update version in
	files: ["package.json", "manifest.json", "versions.json"],

	// Commit and tag by default
	commit: "chore: release v%s",
	tag: "%s", // No 'v' prefix for Obsidian (required)
	push: true,

	// Require confirmation before bumping
	confirm: true,

	// Execute build before committing
	execute: "bun run build:prod",

	// Don't run install after version bump
	install: false,

	// No git verification hooks
	noVerify: false,

	// Include all modified files in commit
	all: true,
});
