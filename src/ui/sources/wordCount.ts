import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata, IDot } from "obsidian-calendar-ui";
import { getWeeklyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";

import { DEFAULT_WORDS_PER_DOT, NUM_MAX_DOTS } from "src/constants";

import { dailyNotes, settings, weeklyNotes } from "../stores";
import { clamp, getWordCount, getDailyNoteCustom } from "../utils";

export async function getWordLengthAsDots(note: TFile): Promise<number> {
	const { wordsPerDot = DEFAULT_WORDS_PER_DOT } = get(settings);
	if (!note || wordsPerDot <= 0) {
		return 0;
	}
	const fileContents = await window.app.vault.cachedRead(note);

	const wordCount = getWordCount(fileContents);
	const numDots = wordCount / wordsPerDot;
	return clamp(Math.floor(numDots), 1, NUM_MAX_DOTS);
}

export async function getDotsForDailyNote(
	dailyNote: TFile | null
): Promise<IDot[]> {
	if (!dailyNote) {
		return [];
	}
	const numSolidDots = await getWordLengthAsDots(dailyNote);

	const dots = [];
	for (let i = 0; i < numSolidDots; i++) {
		dots.push({
			color: "default",
			isFilled: true,
		});
	}
	return dots;
}

export const wordCountSource = {
	getDailyMetadata: async (date: Moment): Promise<any> => {
		const file = getDailyNoteCustom(date, get(dailyNotes), get(settings));
		const dots = await getDotsForDailyNote(file);
		return {
			dots,
		};
	},

	getWeeklyMetadata: async (date: Moment): Promise<any> => {
		const file = getWeeklyNote(date, get(weeklyNotes));
		const dots = await getDotsForDailyNote(file);

		return {
			dots,
		};
	},
} as unknown as ICalendarSource;
