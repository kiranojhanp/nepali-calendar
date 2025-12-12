import { ItemView, WorkspaceLeaf, TFile, Notice, Modal, App } from 'obsidian';
import type NepaliCalendarPlugin from '../main';
import {
	NepaliDate,
	gregorianToNepali,
	nepaliToGregorian,
	formatNepaliDate,
	nepaliMonthNames,
	getDaysInNepaliMonth,
	addMonthsToNepaliDate,
	isSameNepaliDate,
	getCurrentNepaliDate,
	getFirstDayOfNepaliMonth
} from './utils/nepali-date';

export const VIEW_TYPE_NEPALI_CALENDAR = 'nepali-calendar-view';

class ConfirmCreateModal extends Modal {
	date: NepaliDate;
	onConfirm: () => void;

	constructor(app: App, date: NepaliDate, onConfirm: () => void) {
		super(app);
		this.date = date;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h3', { text: 'Create new daily note?' });
		contentEl.createEl('p', { 
			text: `Do you want to create a daily note for ${formatNepaliDate(this.date, 'YYYY-MM-DD')}?` 
		});

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
		
		const confirmBtn = buttonContainer.createEl('button', { text: 'Create', cls: 'mod-cta' });
		confirmBtn.addEventListener('click', () => {
			this.onConfirm();
			this.close();
		});

		const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => {
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class NepaliCalendarView extends ItemView {
	plugin: NepaliCalendarPlugin;
	currentDisplayMonth: NepaliDate;
	calendarEl: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: NepaliCalendarPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentDisplayMonth = getCurrentNepaliDate();
	}

	getViewType(): string {
		return VIEW_TYPE_NEPALI_CALENDAR;
	}

	getDisplayText(): string {
		return 'Nepali Calendar';
	}

	getIcon(): string {
		return 'calendar-with-checkmark';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('nepali-calendar-container');

		this.calendarEl = container.createDiv({ cls: 'nepali-calendar' });
		this.renderCalendar();
	}

	async onClose() {
		// Clean up
	}

	renderCalendar() {
		this.calendarEl.empty();

		// Header with navigation
		const header = this.calendarEl.createDiv({ cls: 'calendar-header' });
		
		const prevBtn = header.createEl('button', { text: '‹', cls: 'calendar-nav-btn' });
		prevBtn.addEventListener('click', () => {
			this.currentDisplayMonth = addMonthsToNepaliDate(this.currentDisplayMonth, -1);
			this.renderCalendar();
		});

		const monthYearText = header.createDiv({ cls: 'calendar-month-year' });
		const nepaliMonthYear = `${nepaliMonthNames[this.currentDisplayMonth.month - 1]} ${this.currentDisplayMonth.year}`;
		
		if (this.plugin.settings.showNepaliMonth && this.plugin.settings.showEnglishMonth) {
			const gregorianDate = nepaliToGregorian(getFirstDayOfNepaliMonth(this.currentDisplayMonth.year, this.currentDisplayMonth.month));
			const englishMonth = gregorianDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
			monthYearText.setText(`${nepaliMonthYear} (${englishMonth})`);
		} else if (this.plugin.settings.showNepaliMonth) {
			monthYearText.setText(nepaliMonthYear);
		} else {
			const gregorianDate = nepaliToGregorian(getFirstDayOfNepaliMonth(this.currentDisplayMonth.year, this.currentDisplayMonth.month));
			const englishMonth = gregorianDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
			monthYearText.setText(englishMonth);
		}

		const nextBtn = header.createEl('button', { text: '›', cls: 'calendar-nav-btn' });
		nextBtn.addEventListener('click', () => {
			this.currentDisplayMonth = addMonthsToNepaliDate(this.currentDisplayMonth, 1);
			this.renderCalendar();
		});

		const todayBtn = header.createEl('button', { text: 'Today', cls: 'calendar-today-btn' });
		todayBtn.addEventListener('click', () => {
			this.currentDisplayMonth = getCurrentNepaliDate();
			this.renderCalendar();
		});

		// Days of week header
		const daysHeader = this.calendarEl.createDiv({ cls: 'calendar-days-header' });
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		dayNames.forEach(day => {
			daysHeader.createDiv({ text: day, cls: 'calendar-day-name' });
		});

		// Calendar grid
		const grid = this.calendarEl.createDiv({ cls: 'calendar-grid' });

		const firstDayOfMonth = getFirstDayOfNepaliMonth(this.currentDisplayMonth.year, this.currentDisplayMonth.month);
		const firstGregorianDate = nepaliToGregorian(firstDayOfMonth);
		const startDayOfWeek = firstGregorianDate.getDay(); // 0 = Sunday, 6 = Saturday

		const daysInMonth = getDaysInNepaliMonth(this.currentDisplayMonth.year, this.currentDisplayMonth.month);
		const today = getCurrentNepaliDate();

		// Add empty cells for days before the start of the month
		for (let i = 0; i < startDayOfWeek; i++) {
			grid.createDiv({ cls: 'calendar-day calendar-day-empty' });
		}

		// Add cells for each day of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const nepaliDate: NepaliDate = {
				year: this.currentDisplayMonth.year,
				month: this.currentDisplayMonth.month,
				day
			};

			const dayEl = grid.createDiv({ cls: 'calendar-day' });
			
			// Check if this is today
			if (isSameNepaliDate(nepaliDate, today)) {
				dayEl.addClass('calendar-day-today');
			}

			// Check if a note exists for this date
			const noteExists = this.checkNoteExists(nepaliDate);
			if (noteExists) {
				dayEl.addClass('calendar-day-has-note');
			}

			const dayNumber = dayEl.createDiv({ text: String(day), cls: 'calendar-day-number' });

			// Add click handler
			dayEl.addEventListener('click', async (e) => {
				const isCtrlOrMeta = e.ctrlKey || e.metaKey;
				await this.handleDayClick(nepaliDate, isCtrlOrMeta);
			});

			// Add hover preview support
			dayEl.addEventListener('mouseenter', (e) => {
				if (e.ctrlKey || e.metaKey) {
					this.handleDayHover(nepaliDate, dayEl);
				}
			});
		}
	}

	checkNoteExists(date: NepaliDate): boolean {
		const filename = this.getDailyNoteFilename(date);
		const folder = this.plugin.settings.dailyNoteFolder;
		const path = folder ? `${folder}/${filename}.md` : `${filename}.md`;
		
		const file = this.app.vault.getAbstractFileByPath(path);
		return file instanceof TFile;
	}

	getDailyNoteFilename(date: NepaliDate): string {
		return formatNepaliDate(date, this.plugin.settings.dailyNoteFormat);
	}

	async handleDayClick(date: NepaliDate, openInNewPane: boolean) {
		const filename = this.getDailyNoteFilename(date);
		const folder = this.plugin.settings.dailyNoteFolder;
		const path = folder ? `${folder}/${filename}.md` : `${filename}.md`;

		let file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			// File doesn't exist, create it
			if (this.plugin.settings.shouldConfirmBeforeCreate) {
				new ConfirmCreateModal(this.app, date, async () => {
					await this.createDailyNote(date);
				}).open();
			} else {
				await this.createDailyNote(date);
			}
		} else {
			// File exists, open it
			const leaf = openInNewPane
				? this.app.workspace.getLeaf('split')
				: this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
		}
	}

	async createDailyNote(date: NepaliDate) {
		const filename = this.getDailyNoteFilename(date);
		const folder = this.plugin.settings.dailyNoteFolder;
		
		// Ensure folder exists
		if (folder) {
			const folderExists = this.app.vault.getAbstractFileByPath(folder);
			if (!folderExists) {
				await this.app.vault.createFolder(folder);
			}
		}

		const path = folder ? `${folder}/${filename}.md` : `${filename}.md`;

		// Create the file with basic content
		const content = this.generateDailyNoteContent(date);
		const file = await this.app.vault.create(path, content);

		// Open the file
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);

		// Refresh the calendar to show the new note
		this.renderCalendar();

		new Notice(`Created daily note for ${formatNepaliDate(date, 'YYYY-MM-DD')}`);
	}

	generateDailyNoteContent(date: NepaliDate): string {
		const gregorianDate = nepaliToGregorian(date);
		const nepaliDateStr = formatNepaliDate(date, 'MMMM DD, YYYY');
		const englishDateStr = gregorianDate.toLocaleDateString('en-US', { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});

		return `# ${nepaliDateStr}\n\n**English Date:** ${englishDateStr}\n\n`;
	}

	handleDayHover(date: NepaliDate, targetEl: HTMLElement) {
		const filename = this.getDailyNoteFilename(date);
		const folder = this.plugin.settings.dailyNoteFolder;
		const path = folder ? `${folder}/${filename}.md` : `${filename}.md`;

		this.app.workspace.trigger('link-hover', this, targetEl, path, path);
	}

	refresh() {
		this.renderCalendar();
	}
}
