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
    type NepaliDate
  } from "src/utils/bikramSambat";
  import {
    getWeekStartOffset,
    getOrderedDayNames,
    generateCalendarDays as generateDays,
    getDayTooltip,
    type CalendarDay
  } from "src/utils/calendarHelpers";
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

  export let displayedMonth: Moment;
  export let sources: ICalendarSource[];
  export let onHoverDay: (date: Moment, targetEl: EventTarget) => boolean;
  export let onHoverWeek: (date: Moment, targetEl: EventTarget) => boolean;
  export let onClickDay: (date: Moment, isMetaPressed: boolean) => boolean;
  export let onClickWeek: (date: Moment, isMetaPressed: boolean) => boolean;
  export let onContextMenuDay: (date: Moment, event: MouseEvent) => boolean;
  export let onContextMenuWeek: (date: Moment, event: MouseEvent) => boolean;

  let todayNepali = getCurrentNepaliDate();
  let currentMonthNepali: NepaliDate = { ...todayNepali, day: 1 };
  let calendarDays: CalendarDay[] = [];

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
      void $activeFile; // Ensure re-render when active file changes
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
      if (onClickDay) {
          onClickDay(day.gregorian, event.metaKey || event.ctrlKey);
      }
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
                                aria-label={getTooltip(day.gregorian)}
                                on:click={(e) => handleDayClick(day, e)}
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