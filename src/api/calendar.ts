/**
 * Calendar API client with offline caching support
 * Uses miti.bikram.io API for accurate Nepali calendar data
 */

export interface NepaliCalendarDay {
	year: number;
	month: number;
	day: number;
	weekDay: number;
	ad: string; // Gregorian date in YYYY-MM-DD format
	tithi?: string;
	holiday?: string;
	event?: string;
}

export interface NepaliMonthData {
	year: number;
	month: number;
	days: NepaliCalendarDay[];
	totalDays: number;
}

/**
 * In-memory cache to avoid repeated localStorage lookups in the same session
 */
const memoryCache = new Map<string, NepaliMonthData>();

/**
 * Cache duration in milliseconds (30 days)
 */
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Get cache key for a given year and month
 */
function getCacheKey(year: number, month: number): string {
	return `nepali-calendar-${year}-${month.toString().padStart(2, "0")}`;
}

/**
 * Get cached data from localStorage
 */
function getCachedData(year: number, month: number): NepaliMonthData | null {
	// Check memory cache first
	const cacheKey = getCacheKey(year, month);
	if (memoryCache.has(cacheKey)) {
		return memoryCache.get(cacheKey)!;
	}

	// Check localStorage
	try {
		const cached = localStorage.getItem(cacheKey);
		if (!cached) return null;

		const { data, timestamp } = JSON.parse(cached);
		const now = Date.now();

		// Check if cache is still valid
		if (now - timestamp < CACHE_DURATION) {
			memoryCache.set(cacheKey, data);
			return data;
		}

		// Cache expired, remove it
		localStorage.removeItem(cacheKey);
	} catch (error) {
		console.error("Error reading calendar cache:", error);
	}

	return null;
}

/**
 * Save data to cache (both memory and localStorage)
 */
function setCachedData(
	year: number,
	month: number,
	data: NepaliMonthData
): void {
	const cacheKey = getCacheKey(year, month);

	// Save to memory cache
	memoryCache.set(cacheKey, data);

	// Save to localStorage
	try {
		localStorage.setItem(
			cacheKey,
			JSON.stringify({
				data,
				timestamp: Date.now(),
			})
		);
	} catch (error) {
		console.error("Error saving calendar cache:", error);
	}
}

/**
 * Fetch calendar data from the API
 */
async function fetchFromAPI(
	year: number,
	month: number
): Promise<NepaliMonthData> {
	const url = `https://data.miti.bikram.io/data/${year}/${month
		.toString()
		.padStart(2, "0")}.json`;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch calendar data: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();
	return data;
}

/**
 * Get calendar data for a given Nepali year and month
 * Uses cache when available, falls back to API
 */
export async function getCalendarData(
	year: number,
	month: number
): Promise<NepaliMonthData> {
	// Try to get from cache first
	const cached = getCachedData(year, month);
	if (cached) {
		return cached;
	}

	// Fetch from API
	try {
		const data = await fetchFromAPI(year, month);
		setCachedData(year, month, data);
		return data;
	} catch (error) {
		console.error(
			`Error fetching calendar data for ${year}-${month}:`,
			error
		);
		throw error;
	}
}

/**
 * Preload calendar data for a range of months
 * Useful for improving perceived performance
 */
export async function preloadCalendarData(
	year: number,
	month: number,
	monthsBefore: number = 1,
	monthsAfter: number = 2
): Promise<void> {
	const promises: Promise<NepaliMonthData>[] = [];

	// Calculate range
	for (let i = -monthsBefore; i <= monthsAfter; i++) {
		let targetYear = year;
		let targetMonth = month + i;

		// Handle year boundaries
		while (targetMonth < 1) {
			targetMonth += 12;
			targetYear -= 1;
		}
		while (targetMonth > 12) {
			targetMonth -= 12;
			targetYear += 1;
		}

		promises.push(getCalendarData(targetYear, targetMonth));
	}

	// Fetch in parallel
	await Promise.allSettled(promises);
}

/**
 * Clear all cached calendar data
 */
export function clearCalendarCache(): void {
	memoryCache.clear();

	try {
		const keys = Object.keys(localStorage);
		for (const key of keys) {
			if (key.startsWith("nepali-calendar-")) {
				localStorage.removeItem(key);
			}
		}
	} catch (error) {
		console.error("Error clearing calendar cache:", error);
	}
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
	memorySize: number;
	localStorageSize: number;
} {
	const localStorageKeys = Object.keys(localStorage).filter((key) =>
		key.startsWith("nepali-calendar-")
	);

	return {
		memorySize: memoryCache.size,
		localStorageSize: localStorageKeys.length,
	};
}
