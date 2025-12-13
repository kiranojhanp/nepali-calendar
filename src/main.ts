import type { Moment, WeekSpec } from "moment";
import { App, Plugin, WorkspaceLeaf } from "obsidian";

import { VIEW_TYPE_CALENDAR } from "./constants";
import { settings } from "./ui/stores";
import {
	appHasPeriodicNotesPluginLoaded,
	CalendarSettingsTab,
} from "./settings";
import type { ISettings } from "./settings";
import CalendarView from "./view";

/**
 * Global type extensions for Obsidian app context
 */
declare global {
	interface Window {
		app: App;
		moment: () => Moment;
		_bundledLocaleWeekSpec: WeekSpec;
	}
}

/**
 * Main plugin class for the Nepali Calendar
 * Manages calendar view lifecycle and plugin commands
 */
export default class CalendarPlugin extends Plugin {
	public options!: ISettings;
	private view!: CalendarView;

	/**
	 * Clean up when plugin is disabled
	 */
	onunload(): void {
		this.app.workspace
			.getLeavesOfType(VIEW_TYPE_CALENDAR)
			.forEach((leaf) => leaf.detach());
	}

	/**
	 * Initialize plugin on load
	 */
	async onload(): Promise<void> {
		// Subscribe to settings changes
		this.register(
			settings.subscribe((value) => {
				this.options = value;
			})
		);

		// Register the calendar view
		this.registerView(
			VIEW_TYPE_CALENDAR,
			(leaf: WorkspaceLeaf) => (this.view = new CalendarView(leaf))
		);

		// Command: Open calendar view
		this.addCommand({
			id: "show-calendar-view",
			name: "Open Nepali Calendar",
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR)
							.length === 0
					);
				}
				this.initLeaf();
			},
		});

		// Command: Open weekly note (requires Periodic Notes plugin)
		this.addCommand({
			id: "open-weekly-note",
			name: "Open Weekly Note",
			checkCallback: (checking) => {
				if (checking) {
					return !appHasPeriodicNotesPluginLoaded();
				}
				this.view.openOrCreateWeeklyNote(window.moment(), false);
			},
		});

		// Command: Reveal the active note in calendar
		this.addCommand({
			id: "reveal-active-note",
			name: "Reveal active note",
			callback: () => this.view.revealActiveNote(),
		});

		await this.loadOptions();

		this.addSettingTab(new CalendarSettingsTab(this.app, this));

		// Initialize calendar view when workspace is ready
		if (this.app.workspace.layoutReady) {
			this.initLeaf();
		} else {
			this.registerEvent(
				this.app.workspace.on(
					"layout-ready" as any,
					this.initLeaf.bind(this)
				)
			);
		}
	}

	/**
	 * Initialize calendar view in right sidebar
	 */
	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR).length) {
			return;
		}
		const right = this.app.workspace.getRightLeaf(false);
		if (right) {
			right.setViewState({
				type: VIEW_TYPE_CALENDAR,
			});
		}
	}

	/**
	 * Load plugin settings from disk
	 */
	async loadOptions(): Promise<void> {
		const options = await this.loadData();
		settings.update((old) => {
			return {
				...old,
				...(options || {}),
			};
		});

		await this.saveData(this.options);
	}

	/**
	 * Update and persist plugin settings
	 */
	async writeOptions(
		changeOpts: (settings: ISettings) => Partial<ISettings>
	): Promise<void> {
		settings.update((old) => ({ ...old, ...changeOpts(old) }));
		await this.saveData(this.options);
	}
}
