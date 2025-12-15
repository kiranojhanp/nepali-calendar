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
