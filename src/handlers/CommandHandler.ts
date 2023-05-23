import GptActionsPlugin from "../../main";
import QueryGptModal from "modals/QueryGptModal";
import SelectGptAction from "modals/SelectGptAction";

export default class CommandHandler {

	constructor(private plugin: GptActionsPlugin) { }

	registerCommands(): void {
		this.plugin.addCommand({
			id: 'gpt-actions-freeform',
			name: 'Ask GPT',
			callback: () => {
				new QueryGptModal(this.plugin).open();
			}
		});

		this.plugin.addCommand({
			id: 'gpt-actions-pick-action',
			name: 'Pick Action',
			callback: () => {
				new SelectGptAction(this.plugin).open();
			}
		});

	}

}
