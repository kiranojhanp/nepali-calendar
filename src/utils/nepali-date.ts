/**
 * Nepali Date (Bikram Sambat) utilities
 * This file contains functions for working with Nepali calendar dates
 */

// Nepali calendar data (days in each month for different years)
// Format: [year]: [days in Baisakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra]
const nepaliCalendarData: { [year: number]: number[] } = {
	2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
	2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
	2082: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
	2083: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
	2084: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
	2085: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
	2086: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
	2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
	2088: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
	2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
	2090: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
};

export const nepaliMonthNames = [
	'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
	'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const nepaliDayNames = [
	'Aaitabar', 'Sombar', 'Mangalbar', 'Budhabar', 
	'Bihibar', 'Shukrabar', 'Shanibar'
];

// Reference date: 2080-01-01 BS = 2023-04-14 AD
const referenceBS = { year: 2080, month: 1, day: 1 };
const referenceAD = new Date(2023, 3, 14); // April 14, 2023

export interface NepaliDate {
	year: number;
	month: number; // 1-12
	day: number;
}

/**
 * Convert Gregorian date to Nepali date (Bikram Sambat)
 */
export function gregorianToNepali(date: Date): NepaliDate {
	// Calculate days difference from reference date
	const timeDiff = date.getTime() - referenceAD.getTime();
	const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

	let year = referenceBS.year;
	let month = referenceBS.month;
	let day = referenceBS.day + daysDiff;

	// Adjust for days overflow/underflow
	while (day > 0) {
		const daysInMonth = getDaysInNepaliMonth(year, month);
		if (day <= daysInMonth) {
			break;
		}
		day -= daysInMonth;
		month++;
		if (month > 12) {
			month = 1;
			year++;
		}
	}

	while (day <= 0) {
		month--;
		if (month < 1) {
			month = 12;
			year--;
		}
		day += getDaysInNepaliMonth(year, month);
	}

	return { year, month, day };
}

/**
 * Convert Nepali date (Bikram Sambat) to Gregorian date
 */
export function nepaliToGregorian(nepaliDate: NepaliDate): Date {
	const { year, month, day } = nepaliDate;
	
	// Calculate total days from reference date
	let totalDays = 0;
	
	// Add days for year difference
	if (year > referenceBS.year) {
		for (let y = referenceBS.year; y < year; y++) {
			totalDays += getTotalDaysInNepaliYear(y);
		}
	} else if (year < referenceBS.year) {
		for (let y = year; y < referenceBS.year; y++) {
			totalDays -= getTotalDaysInNepaliYear(y);
		}
	}
	
	// Add days for month difference
	if (year === referenceBS.year) {
		if (month > referenceBS.month) {
			for (let m = referenceBS.month; m < month; m++) {
				totalDays += getDaysInNepaliMonth(year, m);
			}
		} else if (month < referenceBS.month) {
			for (let m = month; m < referenceBS.month; m++) {
				totalDays -= getDaysInNepaliMonth(year, m);
			}
		}
		totalDays += (day - referenceBS.day);
	} else if (year > referenceBS.year) {
		// Add remaining days of reference month
		totalDays += getDaysInNepaliMonth(referenceBS.year, referenceBS.month) - referenceBS.day;
		// Add days from subsequent months in reference year
		for (let m = referenceBS.month + 1; m <= 12; m++) {
			totalDays += getDaysInNepaliMonth(referenceBS.year, m);
		}
		// Add days from months in target year
		for (let m = 1; m < month; m++) {
			totalDays += getDaysInNepaliMonth(year, m);
		}
		totalDays += day;
	} else {
		// year < referenceBS.year
		// Subtract days from current position to beginning of month
		totalDays -= referenceBS.day;
		// Subtract days from previous months in reference year
		for (let m = 1; m < referenceBS.month; m++) {
			totalDays -= getDaysInNepaliMonth(referenceBS.year, m);
		}
		// Subtract days from target year
		for (let m = month + 1; m <= 12; m++) {
			totalDays -= getDaysInNepaliMonth(year, m);
		}
		totalDays -= (getDaysInNepaliMonth(year, month) - day);
	}
	
	// Create new date from reference
	const result = new Date(referenceAD);
	result.setDate(result.getDate() + totalDays);
	return result;
}

/**
 * Get number of days in a Nepali month
 */
export function getDaysInNepaliMonth(year: number, month: number): number {
	if (!nepaliCalendarData[year]) {
		console.warn(`Nepali calendar data not available for year ${year}. Using default value.`);
		// Default fallback
		return 30;
	}
	return nepaliCalendarData[year][month - 1];
}

/**
 * Get total days in a Nepali year
 */
function getTotalDaysInNepaliYear(year: number): number {
	if (!nepaliCalendarData[year]) {
		console.warn(`Nepali calendar data not available for year ${year}. Using default value of 365 days.`);
		return 365; // Default fallback
	}
	return nepaliCalendarData[year].reduce((sum, days) => sum + days, 0);
}

/**
 * Format Nepali date as string
 */
export function formatNepaliDate(nepaliDate: NepaliDate, format = 'YYYY-MM-DD'): string {
	const { year, month, day } = nepaliDate;
	
	return format
		.replace('YYYY', String(year))
		.replace('MM', String(month).padStart(2, '0'))
		.replace('DD', String(day).padStart(2, '0'))
		.replace('MMMM', nepaliMonthNames[month - 1])
		.replace('M', String(month));
}

/**
 * Get the first day of Nepali month
 */
export function getFirstDayOfNepaliMonth(year: number, month: number): NepaliDate {
	return { year, month, day: 1 };
}

/**
 * Get the last day of Nepali month
 */
export function getLastDayOfNepaliMonth(year: number, month: number): NepaliDate {
	return { year, month, day: getDaysInNepaliMonth(year, month) };
}

/**
 * Add months to a Nepali date
 */
export function addMonthsToNepaliDate(date: NepaliDate, months: number): NepaliDate {
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
export function isSameNepaliDate(date1: NepaliDate, date2: NepaliDate): boolean {
	return date1.year === date2.year && 
	       date1.month === date2.month && 
	       date1.day === date2.day;
}

/**
 * Get current Nepali date
 */
export function getCurrentNepaliDate(): NepaliDate {
	return gregorianToNepali(new Date());
}
