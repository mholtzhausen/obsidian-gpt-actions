import { Modal, TextAreaComponent, MarkdownView } from 'obsidian'
import { Configuration, OpenAIApi } from "openai"
import GptActionsPlugin from '../../main';


export default class QueryGptModal extends Modal {
	private completionEl: TextAreaComponent;
	private promptEl: TextAreaComponent;
	private prompt: string;
	private selectedText: string;

	constructor(private plugin: GptActionsPlugin) {
		super(app);
	}

	constructCompletion() {
		let fullPrompt = this.prompt || '';
		console.log({ selectedText: this.selectedText, fullPrompt })
		if (this.selectedText != '') {
			fullPrompt = `Context: \n===\n${this.selectedText}\n===\n\n${this.prompt || ''}`;
		}

		this.completionEl.inputEl.setText(fullPrompt);
		return fullPrompt;
	}

	async query(prompt: string): Promise<string> {
		const configuration = new Configuration({
			apiKey: this.plugin.settings.openAiApiKey,
		});
		const openai = new OpenAIApi(configuration);

		const completion = await openai.createChatCompletion({
			model: this.plugin.settings.modelName,
			temperature: this.plugin.settings.modelTemperature,
			messages: [{ role: "user", content: prompt }],
		})

		return `${completion?.data?.choices[0]?.message?.content}`
	}

	onOpen() {
		const { contentEl } = this;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			this.selectedText = view.editor.getSelection();
		}

		this.modalEl.addClass('gpt-actions-pick-action-modal');

		contentEl.createDiv({ cls: 'gpt-actions-pick-action-title' }).setText('GPT Actions')
		contentEl.createEl('hr', { cls: 'gpt-actions-pick-action-hr' })
		this.completionEl = new TextAreaComponent(contentEl)
		this.completionEl.inputEl.classList.add('gpt-actions-pick-action-completion');
		this.completionEl.inputEl.readOnly = true;
		this.completionEl.setDisabled(true);


		this.promptEl = new TextAreaComponent(contentEl)
		this.promptEl.inputEl.rows = 5;
		this.promptEl.inputEl.classList.add('gpt-actions-pick-action-input');
		this.promptEl.inputEl.placeholder = 'Enter some text...';

		this.promptEl.onChange(async (value) => {
			this.prompt = value;
			// this.constructCompletion();
		});

		this.promptEl.inputEl.addEventListener('focus', () => { this.completionEl.setDisabled(false) })

		this.promptEl.inputEl.addEventListener('keydown', async (e) => {
			if (e.key === 'Enter' && e.ctrlKey) {
				this.promptEl.setDisabled(true);
				const content = await this.query(this.constructCompletion())
				this.promptEl.setDisabled(false)
				this.completionEl.inputEl.setText(content);
			}
		})

		this.constructCompletion()
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
