/**
 * Simple test script to verify API integration
 * Run with: node test-api.js (after building)
 */

// This is a conceptual test - in practice, you'd test in Obsidian
const testAPI = async () => {
    console.log("🧪 Testing Nepali Calendar API Integration\n");

    // Test 1: Fetch calendar data
    console.log("Test 1: Fetching December 2024 (BS 2081-09)...");
    try {
        const response = await fetch(
            "https://data.miti.bikram.io/data/2081/09.json"
        );
        const data = await response.json();
        console.log("✅ API fetch successful");
        console.log(`   Year: ${data.year}, Month: ${data.month}`);
        console.log(`   Total Days: ${data.totalDays}`);
        console.log(
            `   First Day: BS ${data.days[0].year}-${data.days[0].month}-${data.days[0].day} = AD ${data.days[0].ad}\n`
        );
    } catch (error) {
        console.error("❌ API fetch failed:", error);
    }

    // Test 2: Verify data structure
    console.log("Test 2: Verifying data structure...");
    try {
        const response = await fetch(
            "https://data.miti.bikram.io/data/2081/09.json"
        );
        const data = await response.json();

        const requiredFields = [
            "year",
            "month",
            "totalDays",
            "days",
        ];
        const hasAllFields = requiredFields.every(
            (field) => field in data
        );

        if (hasAllFields && Array.isArray(data.days)) {
            console.log("✅ Data structure valid");
            console.log(`   Days array length: ${data.days.length}\n`);
        } else {
            console.error("❌ Invalid data structure");
        }
    } catch (error) {
        console.error("❌ Structure validation failed:", error);
    }

    // Test 3: Check multiple months
    console.log("Test 3: Testing multiple months (BS 2081)...");
    try {
        const months = [1, 6, 12];
        for (const month of months) {
            const response = await fetch(
                `https://data.miti.bikram.io/data/2081/${month
                    .toString()
                    .padStart(2, "0")}.json`
            );
            const data = await response.json();
            console.log(
                `   Month ${month}: ${data.totalDays} days ✅`
            );
        }
        console.log();
    } catch (error) {
        console.error("❌ Multiple months test failed:", error);
    }

    // Test 4: localStorage simulation
    console.log("Test 4: Cache simulation...");
    const mockCache = new Map();
    const cacheKey = "nepali-calendar-2081-09";
    mockCache.set(cacheKey, {
        data: { year: 2081, month: 9, totalDays: 30 },
        timestamp: Date.now(),
    });
    console.log("✅ Cache stored");
    console.log(`   Cache size: ${mockCache.size} entries\n`);

    console.log("🎉 All tests completed!");
    console.log("\nNext steps:");
    console.log("1. Build the plugin: npm run build");
    console.log(
        "2. Reload Obsidian with the plugin enabled"
    );
    console.log("3. Open the calendar view");
    console.log("4. Navigate months to trigger preloading");
    console.log(
        "5. Check browser console for any errors"
    );
    console.log(
        "6. Go offline and verify calendar still works"
    );
};

// Run tests if this file is executed directly
if (typeof window === "undefined") {
    testAPI().catch(console.error);
}

// Export for use in other contexts
if (typeof module !== "undefined" && module.exports) {
    module.exports = { testAPI };
}
