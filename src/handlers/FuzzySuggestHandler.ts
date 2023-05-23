import { FuzzySuggestModal, TFile } from "obsidian";
import { get_tfiles_from_folder } from "utils/Utils";
import TemplaterPlugin from "../../main";
import { errorWrapperSync } from "utils/Error";
import { log_error } from "utils/Log";
import QueryGptModal from "modals/QueryGptModal";

export enum OpenMode {
	InsertTemplate,
	CreateNoteTemplate,
}

export class FuzzySuggester extends FuzzySuggestModal<TFile> {
	private plugin: TemplaterPlugin;

	constructor(plugin: TemplaterPlugin) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder('Select GPT Action Template');

	}

	getItems(): TFile[] {
		if (!this.plugin.settings.templatesFolder) {
			return app.vault.getMarkdownFiles();
		}
		const files = errorWrapperSync(
			() => get_tfiles_from_folder(this.plugin.settings.templatesFolder),
			`Couldn't retrieve template files from templates folder ${this.plugin.settings.templatesFolder}`
		);
		if (!files) {
			return [];
		}
		return files;
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	async onChooseItem(template: TFile): Promise<void> {
		console.log(template)
		const query = new QueryGptModal(this.plugin, template);
		query.open();
	}

	start(): void {
		this.titleEl.createEl('span', { text: ' (Press enter to insert)' });
		try {
			this.open();
		} catch (e) {
			log_error(e);
		}
	}



	// renderSuggestion(item: FuzzyMatch<TFile>, el: HTMLElement): void {
	// 	super.renderSuggestion(item, el);
	// }
}
