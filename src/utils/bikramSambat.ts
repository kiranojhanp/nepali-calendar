/**
 * Bikram Sambat (Nepali Calendar) utilities
 * Using the bikram-sambat library for conversion
 */

// @ts-ignore
import { toBik, toGreg, daysInMonth } from "bikram-sambat";

export const nepaliMonthNames = [
	"Baisakh",
	"Jestha",
	"Ashadh",
	"Shrawan",
	"Bhadra",
	"Ashwin",
	"Kartik",
	"Mangsir",
	"Poush",
	"Magh",
	"Falgun",
	"Chaitra",
];

export const nepaliDayNames = [
	"Aaitabar",
	"Sombar",
	"Mangalbar",
	"Budhabar",
	"Bihibar",
	"Shukrabar",
	"Shanibar",
];

export interface NepaliDate {
	year: number;
	month: number; // 1-12
	day: number;
}

/**
 * Get number of days in a Nepali month
 */
export function getDaysInNepaliMonth(year: number, month: number): number {
	return daysInMonth(year, month);
}

/**
 * Convert Gregorian date to Nepali date (Bikram Sambat)
 */
export function gregorianToNepali(date: Date): NepaliDate {
	const bs = toBik(date);
	return {
		year: bs.year,
		month: bs.month,
		day: bs.day,
	};
}

/**
 * Convert Nepali date (Bikram Sambat) to Gregorian date
 */
export function nepaliToGregorian(nepaliDate: NepaliDate): Date {
	const { year, month, day } = nepaliDate;
	const greg = toGreg(year, month, day);
	// toGreg returns { year, month, day } where month is 1-indexed (based on my test)
	// JS Date expects 0-indexed month
	return new Date(greg.year, greg.month - 1, greg.day);
}

/**
 * Format Nepali date as string
 */
export function formatNepaliDate(
	nepaliDate: NepaliDate,
	format = "YYYY-MM-DD"
): string {
	const { year, month, day } = nepaliDate;

	return format
		.replace("YYYY", String(year))
		.replace("MM", String(month).padStart(2, "0"))
		.replace("DD", String(day).padStart(2, "0"))
		.replace("MMMM", nepaliMonthNames[month - 1])
		.replace("M", String(month));
}

/**
 * Get the first day of Nepali month
 */
export function getFirstDayOfNepaliMonth(
	year: number,
	month: number
): NepaliDate {
	return { year, month, day: 1 };
}

/**
 * Get the last day of Nepali month
 */
export function getLastDayOfNepaliMonth(
	year: number,
	month: number
): NepaliDate {
	return { year, month, day: getDaysInNepaliMonth(year, month) };
}

/**
 * Add months to a Nepali date
 */
export function addMonthsToNepaliDate(
	date: NepaliDate,
	months: number
): NepaliDate {
	let { year, month, day } = date;

	month += months;

	while (month > 12) {
		month -= 12;
		year++;
	}

	while (month < 1) {
		month += 12;
		year--;
	}

	// Adjust day if it exceeds the number of days in the new month
	const maxDays = getDaysInNepaliMonth(year, month);
	if (day > maxDays) {
		day = maxDays;
	}

	return { year, month, day };
}

/**
 * Check if two Nepali dates are the same
 */
export function isSameNepaliDate(
	date1: NepaliDate,
	date2: NepaliDate
): boolean {
	return (
		date1.year === date2.year &&
		date1.month === date2.month &&
		date1.day === date2.day
	);
}

/**
 * Get current Nepali date
 */
export function getCurrentNepaliDate(): NepaliDate {
	return gregorianToNepali(new Date());
}
