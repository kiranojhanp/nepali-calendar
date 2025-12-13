import type { Moment } from "moment";
import type { NepaliDate } from "./bikramSambat";
import {
	getDaysInNepaliMonth,
	addMonthsToNepaliDate,
	nepaliToGregorian,
} from "./bikramSambat";

export const NEPALI_DAYS_SHORT = [
	"आइत",
	"सोम",
	"मंगल",
	"बुध",
	"बिही",
	"शुक्र",
	"शनि",
];

export const WEEK_START_MAP: Record<string, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
	locale: 0, // Default to Sunday if locale not available
};

export interface CalendarDay {
	day: number;
	nepali: NepaliDate;
	gregorian: Moment;
	isCurrentMonth: boolean;
}

/**
 * Get the week start offset (0-6) from the week start setting
 */
export function getWeekStartOffset(weekStart: string): number {
	return WEEK_START_MAP[weekStart] || 0;
}

/**
 * Reorder day names based on week start setting
 */
export function getOrderedDayNames(weekStartOffset: number): string[] {
	return [
		...NEPALI_DAYS_SHORT.slice(weekStartOffset),
		...NEPALI_DAYS_SHORT.slice(0, weekStartOffset),
	];
}

/**
 * Generate calendar days for a given Nepali month
 */
export function generateCalendarDays(
	date: NepaliDate,
	weekStart: number
): CalendarDay[] {
	const { year, month } = date;
	const daysInMonth = getDaysInNepaliMonth(year, month);
	const firstDay = { year, month, day: 1 };
	const firstDayGregorian = nepaliToGregorian(firstDay);
	let startDayOfWeek = firstDayGregorian.getDay(); // 0 = Sunday

	// Adjust for week start setting
	startDayOfWeek = (startDayOfWeek - weekStart + 7) % 7;

	const days: CalendarDay[] = [];

	// Previous month padding
	const prevMonthDate = addMonthsToNepaliDate(firstDay, -1);
	const daysInPrevMonth = getDaysInNepaliMonth(
		prevMonthDate.year,
		prevMonthDate.month
	);

	for (let i = 0; i < startDayOfWeek; i++) {
		const dayNum = daysInPrevMonth - startDayOfWeek + i + 1;
		const nepaliDate = { ...prevMonthDate, day: dayNum };
		const gregorian = window.moment(nepaliToGregorian(nepaliDate));
		days.push({
			day: dayNum,
			nepali: nepaliDate,
			gregorian,
			isCurrentMonth: false,
		});
	}

	// Current month
	for (let i = 1; i <= daysInMonth; i++) {
		const nepaliDate = { year, month, day: i };
		const gregorian = window.moment(nepaliToGregorian(nepaliDate));
		days.push({
			day: i,
			nepali: nepaliDate,
			gregorian,
			isCurrentMonth: true,
		});
	}

	// Next month padding
	const remainingCells = 42 - days.length; // 6 rows * 7 cols = 42

	const nextMonthDate = addMonthsToNepaliDate(firstDay, 1);
	for (let i = 1; i <= remainingCells; i++) {
		const nepaliDate = { ...nextMonthDate, day: i };
		const gregorian = window.moment(nepaliToGregorian(nepaliDate));
		days.push({
			day: i,
			nepali: nepaliDate,
			gregorian,
			isCurrentMonth: false,
		});
	}

	return days;
}

/**
 * Get tooltip text for a calendar day showing the Gregorian date
 */
export function getDayTooltip(gregorian: Moment, format: string): string {
	return gregorian.format(format);
}
