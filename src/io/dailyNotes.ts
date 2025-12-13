import type { Moment } from "moment";
import { TFile, normalizePath } from "obsidian";

import type { ISettings } from "src/settings";
import { createConfirmationDialog } from "src/ui/modal";

/**
 * Create a daily note file using custom settings
 */
async function createDailyNoteFile(
	date: Moment,
	settings: ISettings
): Promise<TFile> {
	const { vault } = window.app;
	const format = settings.dailyNoteFormat || "YYYY-MM-DD";
	const folder = settings.dailyNoteFolder;
	const template = settings.dailyNoteTemplate;

	const filename = date.format(format);
	const normalizedPath = normalizePath(
		folder ? `${folder}/${filename}.md` : `${filename}.md`
	);

	// Ensure folder exists
	if (folder) {
		const folderPath = normalizePath(folder);
		if (!(await vault.adapter.exists(folderPath))) {
			await vault.createFolder(folderPath);
		}
	}

	// Get template content if specified
	let content = "";
	if (template) {
		const templateFile = vault.getAbstractFileByPath(
			normalizePath(template)
		);
		if (templateFile instanceof TFile) {
			content = await vault.read(templateFile);
		}
	}

	// Create the file
	const file = await vault.create(normalizedPath, content);
	return file;
}

/**
 * Create a Daily Note for a given date.
 */
export async function tryToCreateDailyNote(
	date: Moment,
	inNewSplit: boolean,
	settings: ISettings,
	cb?: (newFile: TFile) => void
): Promise<void> {
	const { workspace } = window.app;
	const format = settings.dailyNoteFormat || "YYYY-MM-DD";
	const filename = date.format(format);

	const createFile = async () => {
		const dailyNote = await createDailyNoteFile(date, settings);
		const leaf = inNewSplit
			? workspace.splitActiveLeaf()
			: workspace.getUnpinnedLeaf();

		await leaf.openFile(dailyNote, { active: true });
		cb?.(dailyNote);
	};

	if (settings.shouldConfirmBeforeCreate) {
		createConfirmationDialog({
			cta: "Create",
			onAccept: createFile,
			text: `File ${filename} does not exist. Would you like to create it?`,
			title: "New Daily Note",
		});
	} else {
		await createFile();
	}
}
