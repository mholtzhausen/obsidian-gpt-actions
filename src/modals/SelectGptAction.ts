import { Modal } from 'obsidian'
import GptActionsPlugin from '../../main';

export default class SelectGPTAction extends Modal {
	constructor(private plugin: GptActionsPlugin) {
		super(app);
	}

	onOpen() {
		this.contentEl.empty();
	}

	onClose() {
		this.contentEl.empty();
	}
}
