<svelte:options immutable />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { Moment } from "moment";
  import { setIcon } from "obsidian";
  import { getDateUID } from "obsidian-daily-notes-interface";
  import {
    gregorianToNepali,
    nepaliToGregorian,
    getDaysInNepaliMonth,
    nepaliMonthNames,
    nepaliDayNames,
    formatNepaliDate,
    addMonthsToNepaliDate,
    isSameNepaliDate,
    getCurrentNepaliDate,
    type NepaliDate
  } from "src/utils/bikramSambat";
  import nepaliNumber from "src/utils/nepaliNumber";
  import { np_nepaliMonths } from "src/utils/mahina";
  import type { ISettings } from "src/settings";
  import { activeFile, dailyNotes, settings, weeklyNotes } from "./stores";
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
  
  // Map weekStart to day offset (0=Sunday, 1=Monday, etc.)
  const weekStartMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    locale: 0 // Default to Sunday if locale not available
  };

  // Get week start offset from settings
  $: weekStartOffset = weekStartMap[$settings.weekStart] || 0;

  // Reorder day names based on week start
  $: nepaliDaysShortOrdered = (() => {
    const days = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
    return [...days.slice(weekStartOffset), ...days.slice(0, weekStartOffset)];
  })();

  // Sync displayedMonth (Gregorian) with currentMonthNepali
  $: if (displayedMonth) {
      const nepali = gregorianToNepali(displayedMonth.toDate());
      // Only update if significantly different (different month) to avoid loops
      if (nepali.year !== currentMonthNepali.year || nepali.month !== currentMonthNepali.month) {
          currentMonthNepali = { year: nepali.year, month: nepali.month, day: 1 };
      }
  }

  let calendarDays: { day: number, nepali: NepaliDate, gregorian: Moment, isCurrentMonth: boolean }[] = [];

  // Make calendar reactive to both month changes and active file changes
  $: {
      generateCalendarDays(currentMonthNepali, weekStartOffset);
      // Reference $activeFile to ensure re-render when active file changes
      void $activeFile;
  }

  function generateCalendarDays(date: NepaliDate, weekStart: number) {
      const { year, month } = date;
      const daysInMonth = getDaysInNepaliMonth(year, month);
      const firstDay = { year, month, day: 1 };
      const firstDayGregorian = nepaliToGregorian(firstDay);
      let startDayOfWeek = firstDayGregorian.getDay(); // 0 = Sunday

      // Adjust for week start setting
      startDayOfWeek = (startDayOfWeek - weekStart + 7) % 7;

      const days = [];

      // Previous month padding
      let prevMonthDate = addMonthsToNepaliDate(firstDay, -1);
      const daysInPrevMonth = getDaysInNepaliMonth(prevMonthDate.year, prevMonthDate.month);
      
      for (let i = 0; i < startDayOfWeek; i++) {
          const dayNum = daysInPrevMonth - startDayOfWeek + i + 1;
           const nepaliDate = { ...prevMonthDate, day: dayNum };
           const gregorian = window.moment(nepaliToGregorian(nepaliDate));
           days.push({
               day: dayNum,
               nepali: nepaliDate,
               gregorian,
               isCurrentMonth: false
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
               isCurrentMonth: true
           });
      }

      // Next month padding
      const remainingCells = 42 - days.length; // 6 rows * 7 cols = 42
      
      let nextMonthDate = addMonthsToNepaliDate(firstDay, 1);
      for (let i = 1; i <= remainingCells; i++) {
           const nepaliDate = { ...nextMonthDate, day: i };
           const gregorian = window.moment(nepaliToGregorian(nepaliDate));
           days.push({
               day: i,
               nepali: nepaliDate,
               gregorian,
               isCurrentMonth: false
           });
      }
      
      calendarDays = days;
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

  function handleDayClick(day: any, event: MouseEvent) {
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
  
  export function tick() {
    todayNepali = getCurrentNepaliDate();
  }

  // 1 minute heartbeat
  let heartbeat = setInterval(() => {
    tick();
  }, 1000 * 60);

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
        <div class="nav-button" on:click={prevMonth} use:icon={'chevron-left'} aria-label="Previous Month"></div>
        <div class="title">{np_nepaliMonths[currentMonthNepali.month - 1]} {nepaliNumber(String(currentMonthNepali.year))}</div>
        <div class="nav-button" on:click={nextMonth} use:icon={'chevron-right'} aria-label="Next Month"></div>
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
                        <td 
                            class="day" 
                            class:adjacent-month={!day.isCurrentMonth}
                            class:today={isSameNepaliDate(day.nepali, todayNepali)}
                            class:active={$activeFile && getDateUID(day.gregorian, "day") === $activeFile}
                            class:has-note={hasNote(day.gregorian)}
                            on:click={(e) => handleDayClick(day, e)}
                            on:mouseenter={(e) => onHoverDay && onHoverDay(day.gregorian, e.target)}
                            on:contextmenu={(e) => onContextMenuDay && onContextMenuDay(day.gregorian, e)}
                        >
                            {nepaliNumber(String(day.day))}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .nav-button {
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .nav-button:hover {
        background-color: var(--interactive-hover);
    }
    .title {
        flex-grow: 1;
        text-align: center;
        font-weight: bold;
        font-size: 1.1em;
        color: var(--color-text-title);
    }
</style>