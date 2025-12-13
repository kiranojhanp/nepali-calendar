import type { Moment } from "moment";
import type { TFile } from "obsidian";
import { normalizePath } from "obsidian";
import { writable, get } from "svelte/store";

import { defaultSettings } from "src/settings";
import type { ISettings } from "src/settings";

import { getDateUIDFromFile } from "./utils";

/**
 * Get all daily notes using custom plugin settings
 */
function getAllDailyNotesCustom(settings: ISettings): Record<string, TFile> {
	const { vault } = window.app;
	const { moment } = window;
	const format = settings.dailyNoteFormat || "YYYY-MM-DD";
	const folder = settings.dailyNoteFolder;

	const dailyNotes: Record<string, TFile> = {};

	// Get all markdown files from the specified folder
	const files = folder
		? vault.getMarkdownFiles().filter((file) => {
				const normalizedFolder = normalizePath(folder);
				return file.path.startsWith(normalizedFolder + "/");
		  })
		: vault.getMarkdownFiles();

	// Try to parse each file as a daily note
	for (const file of files) {
		const basename = file.basename;
		const date: Moment = moment(basename, format, true);

		if (date.isValid()) {
			const dateString = date.format(format);
			dailyNotes[dateString] = file;
		}
	}

	return dailyNotes;
}

/**
 * Get all weekly notes (still using daily-notes-interface for compatibility)
 */
function getAllWeeklyNotesFromInterface(): Record<string, TFile> {
	try {
		// Try to use obsidian-daily-notes-interface if available
		const { getAllWeeklyNotes } = require("obsidian-daily-notes-interface");
		return getAllWeeklyNotes();
	} catch {
		// If not available, return empty
		return {};
	}
}

function createDailyNotesStore() {
	let hasError = false;
	const store = writable<Record<string, TFile>>({});
	return {
		reindex: () => {
			try {
				const currentSettings = get(settings);
				const dailyNotes = getAllDailyNotesCustom(currentSettings);
				store.set(dailyNotes);
				hasError = false;
			} catch (err) {
				if (!hasError) {
					// Silently handle error - folder may not exist yet
					hasError = true;
				}
				store.set({});
			}
		},
		...store,
	};
}

function createWeeklyNotesStore() {
	let hasError = false;
	const store = writable<Record<string, TFile>>({});
	return {
		reindex: () => {
			try {
				const weeklyNotes = getAllWeeklyNotesFromInterface();
				store.set(weeklyNotes);
				hasError = false;
			} catch (err) {
				if (!hasError) {
					// Silently handle error - weekly notes may not be configured
					hasError = true;
				}
				store.set({});
			}
		},
		...store,
	};
}

export const settings = writable<ISettings>(defaultSettings);
export const dailyNotes = createDailyNotesStore();
export const weeklyNotes = createWeeklyNotesStore();

function createSelectedFileStore() {
	const store = writable<string | null>(null);

	return {
		setFile: (file: TFile | null) => {
			const id = file ? getDateUIDFromFile(file) : null;
			store.set(id);
		},
		...store,
	};
}

export const activeFile = createSelectedFileStore();
