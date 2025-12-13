import type { Moment } from "moment";
import {
	getDateFromFile,
	getWeeklyNote,
	getWeeklyNoteSettings,
} from "obsidian-daily-notes-interface";
import {
	FileView,
	TFile,
	ItemView,
	WorkspaceLeaf,
	TAbstractFile,
} from "obsidian";
import { get } from "svelte/store";

import { TRIGGER_ON_OPEN, VIEW_TYPE_CALENDAR } from "src/constants";
import { tryToCreateDailyNote } from "src/io/dailyNotes";
import { tryToCreateWeeklyNote } from "src/io/weeklyNotes";
import type { ISettings } from "src/settings";

import Calendar from "./ui/Calendar.svelte";
import { showFileMenu } from "./ui/fileMenu";
import { activeFile, dailyNotes, weeklyNotes, settings } from "./ui/stores";
import { getDailyNoteCustom } from "./ui/utils";
import { customTagsSource, streakSource, tasksSource } from "./ui/sources";

export default class CalendarView extends ItemView {
	private calendar!: Calendar;
	private settings!: ISettings;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		this.openOrCreateDailyNote = this.openOrCreateDailyNote.bind(this);
		this.openOrCreateWeeklyNote = this.openOrCreateWeeklyNote.bind(this);

		this.onNoteSettingsUpdate = this.onNoteSettingsUpdate.bind(this);
		this.onFileCreated = this.onFileCreated.bind(this);
		this.onFileDeleted = this.onFileDeleted.bind(this);
		this.onFileModified = this.onFileModified.bind(this);
		this.onFileOpen = this.onFileOpen.bind(this);

		this.onHoverDay = this.onHoverDay.bind(this);
		this.onHoverWeek = this.onHoverWeek.bind(this);

		this.onContextMenuDay = this.onContextMenuDay.bind(this);
		this.onContextMenuWeek = this.onContextMenuWeek.bind(this);

		this.registerEvent(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(<any>this.app.workspace).on(
				"periodic-notes:settings-updated",
				this.onNoteSettingsUpdate
			)
		);
		this.registerEvent(
			this.app.vault.on("create" as any, this.onFileCreated)
		);
		this.registerEvent(
			this.app.vault.on("delete" as any, this.onFileDeleted)
		);
		this.registerEvent(
			this.app.vault.on("modify" as any, this.onFileModified)
		);
		this.registerEvent(
			this.app.workspace.on("file-open" as any, this.onFileOpen)
		);
		settings.subscribe((val) => {
			this.settings = val;

			// Reindex daily notes if format or folder changed
			dailyNotes.reindex();

			// Refresh the calendar if settings change
			if (this.calendar) {
				this.calendar.tick();
			}
		});
	}

	getViewType(): string {
		return VIEW_TYPE_CALENDAR;
	}

	getDisplayText(): string {
		return "Nepali Calendar";
	}

	getIcon(): string {
		return "calendar-with-checkmark";
	}

	onClose(): Promise<void> {
		if (this.calendar) {
			this.calendar.$destroy();
		}
		return Promise.resolve();
	}

	async onOpen(): Promise<void> {
		// Integration point: external plugins can listen for `calendar:open`
		// to feed in additional sources.
		const sources = [customTagsSource, streakSource, tasksSource];
		this.app.workspace.trigger(TRIGGER_ON_OPEN, sources);

		this.calendar = new Calendar({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			target: (this as any).contentEl,
			props: {
				onClickDay: this.openOrCreateDailyNote,
				onClickWeek: this.openOrCreateWeeklyNote,
				onHoverDay: this.onHoverDay,
				onHoverWeek: this.onHoverWeek,
				onContextMenuDay: this.onContextMenuDay,
				onContextMenuWeek: this.onContextMenuWeek,
				sources,
			},
		});
	}

	onHoverDay(
		date: Moment,
		targetEl: EventTarget,
		isMetaPressed: boolean
	): void {
		if (!isMetaPressed) {
			return;
		}
		const format = this.settings.dailyNoteFormat || "YYYY-MM-DD";
		const note = getDailyNoteCustom(date, get(dailyNotes), this.settings);
		this.app.workspace.trigger(
			"link-hover",
			this,
			targetEl,
			date.format(format),
			note?.path
		);
	}

	onHoverWeek(
		date: Moment,
		targetEl: EventTarget,
		isMetaPressed: boolean
	): void {
		if (!isMetaPressed) {
			return;
		}
		const note = getWeeklyNote(date, get(weeklyNotes));
		const { format } = getWeeklyNoteSettings();
		this.app.workspace.trigger(
			"link-hover",
			this,
			targetEl,
			date.format(format),
			note?.path
		);
	}

	private onContextMenuDay(date: Moment, event: MouseEvent): void {
		const note = getDailyNoteCustom(date, get(dailyNotes), this.settings);
		if (!note) {
			// If no file exists for a given day, show nothing.
			return;
		}
		showFileMenu(this.app, note, {
			x: event.pageX,
			y: event.pageY,
		});
	}

	private onContextMenuWeek(date: Moment, event: MouseEvent): void {
		const note = getWeeklyNote(date, get(weeklyNotes));
		if (!note) {
			// If no file exists for a given day, show nothing.
			return;
		}
		showFileMenu(this.app, note, {
			x: event.pageX,
			y: event.pageY,
		});
	}

	private onNoteSettingsUpdate(): void {
		dailyNotes.reindex();
		weeklyNotes.reindex();
		this.updateActiveFile();
	}

	private async onFileDeleted(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile)) {
			return;
		}
		if (getDateFromFile(file, "day")) {
			dailyNotes.reindex();
			this.updateActiveFile();
		}
		if (getDateFromFile(file, "week")) {
			weeklyNotes.reindex();
			this.updateActiveFile();
		}
	}

	private async onFileModified(file: TAbstractFile): Promise<void> {
		if (!(file instanceof TFile)) {
			return;
		}
		const date =
			getDateFromFile(file, "day") || getDateFromFile(file, "week");
		if (date && this.calendar) {
			this.calendar.tick();
		}
	}

	private onFileCreated(file: TAbstractFile): void {
		if (!(file instanceof TFile)) {
			return;
		}
		if (this.app.workspace.layoutReady && this.calendar) {
			if (getDateFromFile(file, "day")) {
				dailyNotes.reindex();
				this.calendar.tick();
			}
			if (getDateFromFile(file, "week")) {
				weeklyNotes.reindex();
				this.calendar.tick();
			}
		}
	}

	public onFileOpen(_file: TFile): void {
		if (this.app.workspace.layoutReady) {
			this.updateActiveFile();
		}
	}

	private updateActiveFile(): void {
		const activeLeaf = this.app.workspace.activeLeaf;

		let file: TFile | null = null;
		if (activeLeaf && activeLeaf.view instanceof FileView) {
			file = activeLeaf.view.file;
		}
		activeFile.setFile(file);

		if (this.calendar) {
			this.calendar.tick();
		}
	}

	public revealActiveNote(): void {
		const { moment } = window;
		const activeLeaf = this.app.workspace.activeLeaf;

		if (activeLeaf && activeLeaf.view instanceof FileView) {
			// Check to see if the active note is a daily-note
			const file = activeLeaf.view.file;
			let date = file ? getDateFromFile(file, "day") : null;
			if (date) {
				this.calendar.$set({ displayedMonth: date });
				return;
			}

			// Check to see if the active note is a weekly-note
			const { format } = getWeeklyNoteSettings();
			if (file) {
				date = moment(file.basename, format, true);
				if (date.isValid()) {
					this.calendar.$set({ displayedMonth: date });
					return;
				}
			}
		}
	}

	async openOrCreateWeeklyNote(
		date: Moment,
		inNewSplit: boolean
	): Promise<void> {
		const { workspace } = this.app;

		const startOfWeek = date.clone().startOf("week");

		const existingFile = getWeeklyNote(date, get(weeklyNotes));

		if (!existingFile) {
			// File doesn't exist
			tryToCreateWeeklyNote(
				startOfWeek,
				inNewSplit,
				this.settings,
				(file) => {
					activeFile.setFile(file);
				}
			);
			return;
		}

		const leaf = inNewSplit
			? workspace.splitActiveLeaf()
			: workspace.getUnpinnedLeaf();
		await leaf.openFile(existingFile);

		activeFile.setFile(existingFile);
		workspace.setActiveLeaf(leaf, true, true);
	}

	async openOrCreateDailyNote(
		date: Moment,
		inNewSplit: boolean
	): Promise<void> {
		const { workspace } = this.app;
		const existingFile = getDailyNoteCustom(
			date,
			get(dailyNotes),
			this.settings
		);
		if (!existingFile) {
			// File doesn't exist
			tryToCreateDailyNote(
				date,
				inNewSplit,
				this.settings,
				(dailyNote: TFile) => {
					activeFile.setFile(dailyNote);
				}
			);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const mode = (this.app.vault as any).getConfig("defaultViewMode");
		const leaf = inNewSplit
			? workspace.splitActiveLeaf()
			: workspace.getUnpinnedLeaf();
		await leaf.openFile(existingFile, { active: true, mode } as any);

		activeFile.setFile(existingFile);
	}
}
