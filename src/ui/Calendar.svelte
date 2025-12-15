<svelte:options immutable />

<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Moment } from "moment";
  import { setIcon } from "obsidian";
  import { getDateUID } from "obsidian-daily-notes-interface";
  import {
    gregorianToNepali,
    nepaliToGregorian,
    addMonthsToNepaliDate,
    isSameNepaliDate,
    getCurrentNepaliDate,
    preloadMonthData,
    type NepaliDate
  } from "src/utils/bikramSambat";
  import {
    getWeekStartOffset,
    getOrderedDayNames,
    generateCalendarDays as generateDays,
    getDayTooltip,
    type CalendarDay
  } from "src/utils/calendarHelpers";
  import { preloadCalendarData, getCalendarData } from "src/api/calendar";
  import nepaliNumber from "src/utils/nepaliNumber";
  import { np_nepaliMonths } from "src/utils/mahina";
  import { CALENDAR_HEARTBEAT_INTERVAL } from "src/constants";
  import {
    TOOLTIP_PREVIOUS_MONTH,
    TOOLTIP_NEXT_MONTH,
    TOOLTIP_TODAY
  } from "src/constants/tooltips";
  import { activeFile, dailyNotes, settings } from "./stores";
  import type { ICalendarSource } from "obsidian-calendar-ui";

  interface EventDetail {
    isHoliday: boolean;
    title?: { np: string; en: string };
  }

  interface DayAPIData {
    calendarInfo: {
      dates: {
        bs: {
          year: { en: string };
          month: { code: { en: string } };
          day: { en: string };
        };
      };
    };
    eventDetails?: EventDetail[];
  }

  export let displayedMonth: Moment;
  // export let sources: ICalendarSource[];
  export let onHoverDay: (date: Moment, targetEl: EventTarget) => boolean;
  // export let onHoverWeek: (date: Moment, targetEl: EventTarget) => boolean;
  export let onClickDay: (date: Moment, isMetaPressed: boolean) => boolean;
  // export let onClickWeek: (date: Moment, isMetaPressed: boolean) => boolean;
  export let onContextMenuDay: (date: Moment, event: MouseEvent) => boolean;
  export let onLongPressDay: (date: Moment) => void;
  // export let onContextMenuWeek: (date: Moment, event: MouseEvent) => boolean;

  let todayNepali = getCurrentNepaliDate();
  let currentMonthNepali: NepaliDate = { ...todayNepali, day: 1 };
  let calendarDays: CalendarDay[] = [];
  let holidayMap = new Map<string, boolean>();
  
  // Long press state
  let longPressTimer: number | null = null;
  const LONG_PRESS_DURATION = 500; // ms

  // Get week start offset from settings
  $: weekStartOffset = getWeekStartOffset($settings.weekStart);

  // Reorder day names based on week start
  $: nepaliDaysShortOrdered = getOrderedDayNames(weekStartOffset);

  // Sync displayedMonth (Gregorian) with currentMonthNepali
  $: if (displayedMonth) {
      const nepali = gregorianToNepali(displayedMonth.toDate());
      if (nepali.year !== currentMonthNepali.year || nepali.month !== currentMonthNepali.month) {
          currentMonthNepali = { year: nepali.year, month: nepali.month, day: 1 };
      }
  }

  // Make calendar reactive to month changes, settings, and active file changes
  $: {
      calendarDays = generateDays(currentMonthNepali, weekStartOffset);
      
      // Mark holidays on calendar days if setting is enabled
      if ($settings.highlightHolidays) {
          calendarDays = calendarDays.map(day => ({
              ...day,
              hasHoliday: day.isCurrentMonth && holidayMap.has(`${day.nepali.year}-${day.nepali.month}-${day.nepali.day}`)
          }));
      }
      
      void $activeFile; // Ensure re-render when active file changes
  }

  // Preload data when month changes
  $: if (currentMonthNepali) {
      preloadSurroundingMonths(currentMonthNepali);
  }

  async function preloadSurroundingMonths(month: NepaliDate) {
      try {
          // Preload current month and adjacent months for smooth navigation
          await preloadCalendarData(month.year, month.month, 1, 2);
          
          // Fetch holiday data for current month if highlighting is enabled
          if ($settings.highlightHolidays) {
              await fetchHolidayData(month);
          }
      } catch (error) {
          // Silently fail - the fallback library will be used
      }
  }
  
  async function fetchHolidayData(month: NepaliDate) {
      try {
          const data = await getCalendarData(month.year, month.month) as unknown as DayAPIData[];
          
          // Clear existing holiday data for this month
          holidayMap = new Map(holidayMap);
          
          // Process the data array to find holidays
          if (Array.isArray(data)) {
              data.forEach((dayData) => {
                  // Check if eventDetails exists and has any holiday events
                  if (dayData.eventDetails && Array.isArray(dayData.eventDetails)) {
                      const hasHoliday = dayData.eventDetails.some((event) => event.isHoliday === true);
                      if (hasHoliday) {
                          const key = `${dayData.calendarInfo.dates.bs.year.en}-${parseInt(dayData.calendarInfo.dates.bs.month.code.en)}-${parseInt(dayData.calendarInfo.dates.bs.day.en)}`;
                          holidayMap.set(key, true);
                      }
                  }
              });
          }
          
          // Trigger reactivity
          calendarDays = [...calendarDays];
      } catch (error) {
          // Silently fail - holidays are optional enhancement
      }
  }

  function prevMonth() {
      currentMonthNepali = addMonthsToNepaliDate(currentMonthNepali, -1);
      updateDisplayedMonth();
  }

  function nextMonth() {
      currentMonthNepali = addMonthsToNepaliDate(currentMonthNepali, 1);
      updateDisplayedMonth();
  }
  
  function updateDisplayedMonth() {
      displayedMonth = window.moment(nepaliToGregorian(currentMonthNepali));
  }

  function goToToday() {
      todayNepali = getCurrentNepaliDate();
      currentMonthNepali = { ...todayNepali, day: 1 };
      updateDisplayedMonth();
  }

  function handleDayClick(day: CalendarDay, event: MouseEvent) {
      // Don't trigger click if it was a long press
      if (longPressTimer !== null) {
          return;
      }
      if (onClickDay) {
          onClickDay(day.gregorian, event.metaKey || event.ctrlKey);
      }
  }

  function handleDayMouseDown(day: CalendarDay) {
      longPressTimer = window.setTimeout(() => {
          if (onLongPressDay) {
              onLongPressDay(day.gregorian);
          }
          longPressTimer = null;
      }, LONG_PRESS_DURATION);
  }

  function handleDayMouseUp() {
      if (longPressTimer !== null) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
      }
  }

  function handleDayTouchStart(day: CalendarDay) {
      handleDayMouseDown(day);
  }

  function handleDayTouchEnd() {
      handleDayMouseUp();
  }

  // Check if a day has a note
  function hasNote(gregorian: Moment): boolean {
      const format = $settings.dailyNoteFormat || "YYYY-MM-DD";
      const dateString = gregorian.format(format);
      return !!$dailyNotes[dateString];
  }

  // Get tooltip for a day
  function getTooltip(gregorian: Moment): string {
      const format = $settings.dailyNoteFormat || "YYYY-MM-DD";
      return getDayTooltip(gregorian, format);
  }
  
  export function tick() {
    todayNepali = getCurrentNepaliDate();
  }

  // Heartbeat to refresh calendar every minute
  let heartbeat = setInterval(() => {
    tick();
  }, CALENDAR_HEARTBEAT_INTERVAL);

  onDestroy(() => {
    clearInterval(heartbeat);
  });
  
  // Icon action
  function icon(node: HTMLElement, iconName: string) {
      setIcon(node, iconName);
  }
</script>

<div id="calendar-container">
    <nav>
        <div class="left-nav">
            <div class="title">
                <span class="month">{np_nepaliMonths[currentMonthNepali.month - 1]}</span>
                <span class="year">{nepaliNumber(String(currentMonthNepali.year))}</span>
            </div>
        </div>
        <div class="right-nav">
            <div 
                class="nav-button" 
                on:click={prevMonth} 
                use:icon={'chevron-left'} 
                aria-label={TOOLTIP_PREVIOUS_MONTH}
            ></div>
            <button 
                class="reset-button" 
                on:click={goToToday}
                aria-label={TOOLTIP_TODAY}
            >TODAY</button>
            <div 
                class="nav-button" 
                on:click={nextMonth} 
                use:icon={'chevron-right'} 
                aria-label={TOOLTIP_NEXT_MONTH}
            ></div>
        </div>
    </nav>
    <table class="calendar">
        <thead>
            <tr>
                {#each nepaliDaysShortOrdered as dayName}
                    <th>{dayName}</th> 
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each Array(Math.ceil(calendarDays.length / 7)) as _, row}
                <tr>
                    {#each calendarDays.slice(row * 7, (row + 1) * 7) as day}
                        <td>
                            <div
                                class="day" 
                                class:adjacent-month={!day.isCurrentMonth}
                                class:today={isSameNepaliDate(day.nepali, todayNepali)}
                                class:active={$activeFile && getDateUID(day.gregorian, "day") === $activeFile}
                                class:has-note={hasNote(day.gregorian)}
                                class:is-holiday={day.hasHoliday && $settings.highlightHolidays}
                                aria-label={getTooltip(day.gregorian)}
                                on:click={(e) => handleDayClick(day, e)}
                                on:mousedown={() => handleDayMouseDown(day)}
                                on:mouseup={handleDayMouseUp}
                                on:mouseleave={handleDayMouseUp}
                                on:touchstart={() => handleDayTouchStart(day)}
                                on:touchend={handleDayTouchEnd}
                                on:touchcancel={handleDayTouchEnd}
                                on:mouseenter={(e) => onHoverDay && onHoverDay(day.gregorian, e.target)}
                                on:contextmenu={(e) => onContextMenuDay && onContextMenuDay(day.gregorian, e)}
                            >
                                {nepaliNumber(String(day.day))}
                            </div>
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    /* Component-scoped styles are intentionally minimal */
    /* Main styles are in styles.css to respect Obsidian theme */
</style>