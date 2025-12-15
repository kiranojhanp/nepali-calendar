import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";
import type { ILocaleOverride, IWeekStartOption } from "obsidian-calendar-ui";

import { DEFAULT_WEEK_FORMAT, DEFAULT_WORDS_PER_DOT } from "src/constants";

import type CalendarPlugin from "./main";

export interface ISettings {
	wordsPerDot: number;
	weekStart: IWeekStartOption;
	shouldConfirmBeforeCreate: boolean;
	highlightHolidays: boolean;
	weekendDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday

	// Daily Note settings
	dailyNoteFormat: string;
	dailyNoteFolder: string;
	dailyNoteTemplate: string;

	// Weekly Note settings
	showWeeklyNote: boolean;
	weeklyNoteFormat: string;
	weeklyNoteTemplate: string;
	weeklyNoteFolder: string;
}

const weekdays = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

export const defaultSettings = Object.freeze({
	shouldConfirmBeforeCreate: true,
	weekStart: "sunday" as IWeekStartOption,
	highlightHolidays: true,
	weekendDays: [6], // Saturday by default

	wordsPerDot: DEFAULT_WORDS_PER_DOT,

	// Daily Note defaults
	dailyNoteFormat: "YYYY-MM-DD",
	dailyNoteFolder: "",
	dailyNoteTemplate: "",

	showWeeklyNote: false,
	weeklyNoteFormat: "",
	weeklyNoteTemplate: "",
	weeklyNoteFolder: "",
});

export function appHasPeriodicNotesPluginLoaded(): boolean {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const periodicNotes = (<any>window.app).plugins.getPlugin("periodic-notes");
	return periodicNotes && periodicNotes.settings?.weekly?.enabled;
}

export class CalendarSettingsTab extends PluginSettingTab {
	private plugin: CalendarPlugin;

	constructor(app: App, plugin: CalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		if (!appHasDailyNotesPluginLoaded()) {
			this.containerEl.createDiv("settings-banner", (banner) => {
				banner.createEl("h3", {
					text: "⚠️ Daily Notes plugin not enabled",
				});
				banner.createEl("p", {
					cls: "setting-item-description",
					text: "The calendar is best used in conjunction with either the Daily Notes plugin or the Periodic Notes plugin (available in the Community Plugins catalog).",
				});
			});
		}

		this.containerEl.createEl("h3", {
			text: "Daily Note Settings",
		});
		this.addDailyNoteFormatSetting();
		this.addDailyNoteFolderSetting();
		this.addDailyNoteTemplateSetting();
		this.addConfirmCreateSetting();

		this.containerEl.createEl("h3", {
			text: "General Settings",
		});
		this.addDotThresholdSetting();
		this.addWeekStartSetting();
		this.addHighlightHolidaysSetting();
		this.addWeekendDaysSetting();
		this.addShowWeeklyNoteSetting();

		if (
			this.plugin.options.showWeeklyNote &&
			!appHasPeriodicNotesPluginLoaded()
		) {
			this.containerEl.createEl("h3", {
				text: "Weekly Note Settings",
			});
			this.containerEl.createEl("p", {
				cls: "setting-item-description",
				text: "Note: Weekly Note settings are moving. You are encouraged to install the 'Periodic Notes' plugin to keep the functionality in the future.",
			});
			this.addWeeklyNoteFormatSetting();
			this.addWeeklyNoteTemplateSetting();
			this.addWeeklyNoteFolderSetting();
		}
	}

	addDotThresholdSetting(): void {
		new Setting(this.containerEl)
			.setName("Words per dot")
			.setDesc("How many words should be represented by a single dot?")
			.addText((textfield) => {
				textfield.setPlaceholder(String(DEFAULT_WORDS_PER_DOT));
				textfield.inputEl.type = "number";
				textfield.setValue(String(this.plugin.options.wordsPerDot));
				textfield.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						wordsPerDot: value !== "" ? Number(value) : undefined,
					}));
				});
			});
	}

	addWeekStartSetting(): void {
		const { moment } = window;

		const localizedWeekdays = moment.weekdays();
		const localeWeekStartNum = window._bundledLocaleWeekSpec.dow;
		const localeWeekStart = moment.weekdays()[localeWeekStartNum];

		new Setting(this.containerEl)
			.setName("Start week on:")
			.setDesc(
				"Choose what day of the week to start. Default is Sunday for Nepal."
			)
			.addDropdown((dropdown) => {
				dropdown.addOption(
					"locale",
					`Locale default (${localeWeekStart})`
				);
				localizedWeekdays.forEach((day, i) => {
					dropdown.addOption(weekdays[i], day);
				});
				dropdown.setValue(this.plugin.options.weekStart);
				dropdown.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						weekStart: value as IWeekStartOption,
					}));
				});
			});
	}

	addConfirmCreateSetting(): void {
		new Setting(this.containerEl)
			.setName("Confirm before creating new note")
			.setDesc("Show a confirmation modal before creating a new note")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.options.shouldConfirmBeforeCreate);
				toggle.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						shouldConfirmBeforeCreate: value,
					}));
				});
			});
	}

	addHighlightHolidaysSetting(): void {
		new Setting(this.containerEl)
			.setName("Highlight holidays")
			.setDesc(
				"Highlight holiday dates with red text color on the calendar"
			)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.options.highlightHolidays);
				toggle.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						highlightHolidays: value,
					}));
				});
			});
	}

	addWeekendDaysSetting(): void {
		const { moment } = window;
		const localizedWeekdays = moment.weekdays();
		const container = this.containerEl.createDiv("weekend-days-setting");

		new Setting(container)
			.setName("Weekend days")
			.setDesc(
				"Select which days should be marked as weekends/holidays. These will be highlighted like other holidays."
			);

		const checkboxContainer = container.createDiv("checkbox-container");
		checkboxContainer.style.display = "flex";
		checkboxContainer.style.flexWrap = "wrap";
		checkboxContainer.style.gap = "10px";
		checkboxContainer.style.marginTop = "10px";

		// Ensure weekendDays is initialized
		const weekendDays = this.plugin.options.weekendDays || [6];

		weekdays.forEach((day, index) => {
			const checkboxWrapper = checkboxContainer.createDiv();
			checkboxWrapper.style.display = "flex";
			checkboxWrapper.style.alignItems = "center";
			checkboxWrapper.style.gap = "5px";

			const checkbox = checkboxWrapper.createEl("input", {
				type: "checkbox",
			});
			checkbox.checked = weekendDays.includes(index);
			checkbox.addEventListener("change", async () => {
				const currentWeekends = [
					...(this.plugin.options.weekendDays || []),
				];
				if (checkbox.checked) {
					if (!currentWeekends.includes(index)) {
						currentWeekends.push(index);
					}
				} else {
					const idx = currentWeekends.indexOf(index);
					if (idx > -1) {
						currentWeekends.splice(idx, 1);
					}
				}
				this.plugin.writeOptions(() => ({
					weekendDays: currentWeekends.sort((a, b) => a - b),
				}));
			});

			const label = checkboxWrapper.createEl("label");
			label.textContent = localizedWeekdays[index];
			label.style.cursor = "pointer";
			label.addEventListener("click", () => {
				checkbox.click();
			});
		});
	}

	addShowWeeklyNoteSetting(): void {
		new Setting(this.containerEl)
			.setName("Show week number")
			.setDesc("Enable this to add a column with the week number")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.options.showWeeklyNote);
				toggle.onChange(async (value) => {
					this.plugin.writeOptions(() => ({ showWeeklyNote: value }));
					this.display(); // show/hide weekly settings
				});
			});
	}

	addWeeklyNoteFormatSetting(): void {
		new Setting(this.containerEl)
			.setName("Weekly note format")
			.setDesc("For more syntax help, refer to format reference")
			.addText((textfield) => {
				textfield.setValue(this.plugin.options.weeklyNoteFormat);
				textfield.setPlaceholder(DEFAULT_WEEK_FORMAT);
				textfield.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						weeklyNoteFormat: value,
					}));
				});
			});
	}

	addWeeklyNoteTemplateSetting(): void {
		new Setting(this.containerEl)
			.setName("Weekly note template")
			.setDesc(
				"Choose the file you want to use as the template for your weekly notes"
			)
			.addText((textfield) => {
				textfield.setValue(this.plugin.options.weeklyNoteTemplate);
				textfield.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						weeklyNoteTemplate: value,
					}));
				});
			});
	}

	addWeeklyNoteFolderSetting(): void {
		new Setting(this.containerEl)
			.setName("Weekly note folder")
			.setDesc("New weekly notes will be placed here")
			.addText((textfield) => {
				textfield.setValue(this.plugin.options.weeklyNoteFolder);
				textfield.onChange(async (value) => {
					this.plugin.writeOptions(() => ({
						weeklyNoteFolder: value,
					}));
				});
			});
	}

	addDailyNoteFormatSetting(): void {
		new Setting(this.containerEl)
			.setName("Daily note format")
			.setDesc(
				"Format for daily note filenames. Use YYYY for year, MM for month, DD for day. Example: YYYY-MM-DD creates 2081-01-15.md"
			)
			.addText((text) => {
				text.setPlaceholder("YYYY-MM-DD")
					.setValue(this.plugin.options.dailyNoteFormat)
					.onChange(async (value) => {
						this.plugin.writeOptions(() => ({
							dailyNoteFormat: value || "YYYY-MM-DD",
						}));
					});
			});
	}

	addDailyNoteFolderSetting(): void {
		new Setting(this.containerEl)
			.setName("Daily note folder")
			.setDesc(
				"Folder where daily notes will be created. Leave empty for vault root."
			)
			.addText((text) => {
				text.setPlaceholder("Example: daily-notes")
					.setValue(this.plugin.options.dailyNoteFolder)
					.onChange(async (value) => {
						this.plugin.writeOptions(() => ({
							dailyNoteFolder: value,
						}));
					});
			});
	}

	addDailyNoteTemplateSetting(): void {
		new Setting(this.containerEl)
			.setName("Daily note template")
			.setDesc(
				"Template file to use when creating daily notes. Leave empty for default template."
			)
			.addText((text) => {
				text.setPlaceholder("Example: templates/daily-note.md")
					.setValue(this.plugin.options.dailyNoteTemplate)
					.onChange(async (value) => {
						this.plugin.writeOptions(() => ({
							dailyNoteTemplate: value,
						}));
					});
			});
	}
}
