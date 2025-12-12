import { App, PluginSettingTab, Setting } from 'obsidian';
import type NepaliCalendarPlugin from '../main';

export interface NepaliCalendarSettings {
	dailyNoteFormat: string;
	dailyNoteFolder: string;
	shouldConfirmBeforeCreate: boolean;
	showNepaliMonth: boolean;
	showEnglishMonth: boolean;
}

export const DEFAULT_SETTINGS: NepaliCalendarSettings = {
	dailyNoteFormat: 'YYYY-MM-DD',
	dailyNoteFolder: '',
	shouldConfirmBeforeCreate: true,
	showNepaliMonth: true,
	showEnglishMonth: true,
};

export class NepaliCalendarSettingTab extends PluginSettingTab {
	plugin: NepaliCalendarPlugin;

	constructor(app: App, plugin: NepaliCalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Nepali Calendar Settings' });

		new Setting(containerEl)
			.setName('Daily note format')
			.setDesc('Date format for daily note filenames (using Nepali date)')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD')
				.setValue(this.plugin.settings.dailyNoteFormat)
				.onChange(async (value) => {
					this.plugin.settings.dailyNoteFormat = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Daily note folder')
			.setDesc('Folder where daily notes will be created')
			.addText(text => text
				.setPlaceholder('Daily Notes')
				.setValue(this.plugin.settings.dailyNoteFolder)
				.onChange(async (value) => {
					this.plugin.settings.dailyNoteFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Confirm before creating new note')
			.setDesc('Show a confirmation modal before creating a new daily note')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.shouldConfirmBeforeCreate)
				.onChange(async (value) => {
					this.plugin.settings.shouldConfirmBeforeCreate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show Nepali month')
			.setDesc('Display Nepali month names in the calendar')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showNepaliMonth)
				.onChange(async (value) => {
					this.plugin.settings.showNepaliMonth = value;
					await this.plugin.saveSettings();
					this.plugin.refreshCalendarView();
				}));

		new Setting(containerEl)
			.setName('Show English month')
			.setDesc('Display English month alongside Nepali month')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showEnglishMonth)
				.onChange(async (value) => {
					this.plugin.settings.showEnglishMonth = value;
					await this.plugin.saveSettings();
					this.plugin.refreshCalendarView();
				}));
	}
}
