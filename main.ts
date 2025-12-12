import { Plugin, WorkspaceLeaf } from 'obsidian';
import { NepaliCalendarView, VIEW_TYPE_NEPALI_CALENDAR } from './src/view';
import { NepaliCalendarSettingTab, NepaliCalendarSettings, DEFAULT_SETTINGS } from './src/settings';
import { getCurrentNepaliDate } from './src/utils/nepali-date';

export default class NepaliCalendarPlugin extends Plugin {
	settings: NepaliCalendarSettings;
	private view: NepaliCalendarView | null = null;

	async onload() {
		await this.loadSettings();

		// Register the calendar view
		this.registerView(
			VIEW_TYPE_NEPALI_CALENDAR,
			(leaf) => {
				this.view = new NepaliCalendarView(leaf, this);
				return this.view;
			}
		);

		// Add ribbon icon
		this.addRibbonIcon('calendar-with-checkmark', 'Open Nepali Calendar', () => {
			this.activateView();
		});

		// Add command to open the calendar view
		this.addCommand({
			id: 'open-nepali-calendar',
			name: 'Open calendar view',
			callback: () => {
				this.activateView();
			}
		});

		// Add command to open today's note
		this.addCommand({
			id: 'open-today-note',
			name: 'Open today\'s daily note',
			callback: async () => {
				const today = getCurrentNepaliDate();
				if (this.view) {
					await this.view.handleDayClick(today, false);
				} else {
					// If view is not initialized, activate it first
					await this.activateView();
					// Give view time to initialize
					setTimeout(async () => {
						if (this.view) {
							await this.view.handleDayClick(today, false);
						}
					}, 100);
				}
			}
		});

		// Add settings tab
		this.addSettingTab(new NepaliCalendarSettingTab(this.app, this));

		// Initialize the view when layout is ready
		this.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEPALI_CALENDAR);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_NEPALI_CALENDAR);

		if (leaves.length > 0) {
			// View already exists, reveal it
			leaf = leaves[0];
		} else {
			// Create new view in right sidebar
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({
					type: VIEW_TYPE_NEPALI_CALENDAR,
					active: true,
				});
				leaf = rightLeaf;
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	refreshCalendarView() {
		if (this.view) {
			this.view.refresh();
		}
	}
}
