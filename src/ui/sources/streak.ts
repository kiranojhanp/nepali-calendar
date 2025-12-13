import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata } from "obsidian-calendar-ui";
import { getWeeklyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";

import { dailyNotes, settings, weeklyNotes } from "../stores";
import { classList, getDailyNoteCustom } from "../utils";

const getStreakClasses = (file: TFile): string[] => {
	return classList({
		"has-note": !!file,
	});
};

export const streakSource = {
	getDailyMetadata: async (date: Moment): Promise<any> => {
		const file = getDailyNoteCustom(date, get(dailyNotes), get(settings));
		return {
			classes: getStreakClasses(file),
			dots: [],
		};
	},

	getWeeklyMetadata: async (date: Moment): Promise<any> => {
		const file = getWeeklyNote(date, get(weeklyNotes));
		return {
			classes: getStreakClasses(file),
			dots: [],
		};
	},
} as unknown as ICalendarSource;
