/**
 * Bikram Sambat (Nepali Calendar) utilities
 * Uses the miti.bikram.io API for accurate data with synchronous fallback
 */

import { getCalendarData, type NepaliMonthData } from "src/api/calendar";

// @ts-ignore - Keep as fallback
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
 * Cache for month data - stores resolved data for synchronous access
 */
const monthDataCache = new Map<string, NepaliMonthData>();
const loadingPromises = new Map<string, Promise<NepaliMonthData>>();

/**
 * Get month data cache key
 */
function getCacheKey(year: number, month: number): string {
	return `${year}-${month}`;
}

/**
 * Preload month data asynchronously
 */
export async function preloadMonthData(
	year: number,
	month: number
): Promise<void> {
	const key = getCacheKey(year, month);

	if (monthDataCache.has(key)) {
		return; // Already loaded
	}

	if (loadingPromises.has(key)) {
		await loadingPromises.get(key);
		return;
	}

	const promise = getCalendarData(year, month).then((data) => {
		monthDataCache.set(key, data);
		loadingPromises.delete(key);
		return data;
	});

	loadingPromises.set(key, promise);
	await promise;
}

/**
 * Get month data synchronously (from cache) or null if not loaded
 */
function getMonthDataSync(year: number, month: number): NepaliMonthData | null {
	const key = getCacheKey(year, month);
	return monthDataCache.get(key) || null;
}

/**
 * Get number of days in a Nepali month
 * Uses cached data if available, falls back to bikram-sambat library
 */
export function getDaysInNepaliMonth(year: number, month: number): number {
	const data = getMonthDataSync(year, month);
	if (data) {
		return data.totalDays;
	}

	// Fallback to bikram-sambat library
	return daysInMonth(year, month);
}

/**
 * Convert Gregorian date to Nepali date (Bikram Sambat)
 * Uses cached data if available, falls back to bikram-sambat library
 */
export function gregorianToNepali(date: Date): NepaliDate {
	const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

	// Try to find in cache (check current and adjacent months)
	const adYear = date.getFullYear();
	const searchYears = [adYear + 56, adYear + 57, adYear + 58];

	for (const year of searchYears) {
		for (let month = 1; month <= 12; month++) {
			const data = getMonthDataSync(year, month);
			if (data) {
				const dayData = data.days.find((d) => d.ad === dateStr);
				if (dayData) {
					return {
						year: dayData.year,
						month: dayData.month,
						day: dayData.day,
					};
				}
			}
		}
	}

	// Fallback to bikram-sambat library
	const bs = toBik(date);
	return {
		year: bs.year,
		month: bs.month,
		day: bs.day,
	};
}

/**
 * Convert Nepali date (Bikram Sambat) to Gregorian date
 * Uses cached data if available, falls back to bikram-sambat library
 */
export function nepaliToGregorian(nepaliDate: NepaliDate): Date {
	const { year, month, day } = nepaliDate;

	const data = getMonthDataSync(year, month);
	if (data) {
		const dayData = data.days.find((d) => d.day === day);
		if (dayData && dayData.ad) {
			const [y, m, d] = dayData.ad.split("-").map(Number);
			return new Date(y, m - 1, d);
		}
	}

	// Fallback to bikram-sambat library
	const greg = toGreg(year, month, day);
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
