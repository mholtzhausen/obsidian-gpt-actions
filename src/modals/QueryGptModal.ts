import { Modal, TextAreaComponent, MarkdownView, TFile } from 'obsidian'
import { Configuration, OpenAIApi } from "openai"
import GptActionsPlugin from '../../main';


export default class QueryGptModal extends Modal {
	private completionEl: TextAreaComponent;
	private promptEl: TextAreaComponent;
	public prompt: string;
	private selectedText: string;

	constructor(private plugin: GptActionsPlugin, public template: TFile | null = null) {
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
			messages: [{ role: "user", content: this.prompt }],
		})

		return `${completion?.data?.choices[0]?.message?.content}`
	}

	async onOpen() {
		const { contentEl } = this;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			this.selectedText = view.editor.getSelection();
		}

		this.modalEl.addClass('gpt-actions-pick-action-modal');

		let title = 'GPT Actions';
		if (this.template) title = `GPT Actions: ${this.template.basename}`

		contentEl.createDiv({ cls: 'gpt-actions-pick-action-title' }).setText(title)
		contentEl.createEl('hr', { cls: 'gpt-actions-pick-action-hr' })
		this.completionEl = new TextAreaComponent(contentEl)
		const completionBox = this.completionEl.inputEl
		completionBox.classList.add('gpt-actions-pick-action-completion');
		completionBox.readOnly = true;
		this.completionEl.setDisabled(true);


		this.promptEl = new TextAreaComponent(contentEl)
		const promptBox = this.promptEl.inputEl
		promptBox.rows = 5;
		promptBox.classList.add('gpt-actions-pick-action-input');
		promptBox.placeholder = 'Enter some text...';

		this.promptEl.onChange(async (value) => {
			this.prompt = value;
		});

		promptBox.addEventListener('focus', () => { this.completionEl.setDisabled(false) })

		promptBox.addEventListener('keydown', async (e) => {
			if (e.key === 'Enter' && e.ctrlKey) {
				this.promptEl.setDisabled(true);
				const content = await this.query(this.prompt)
					.catch((e) => {
						console.error(e);
						return 'Error: ' + e.message;
					});
				this.promptEl.setDisabled(false)
				completionBox.setText(content);
			}
		})

		if (this.template) {
			let templateContent = await this.template.vault.read(this.template)
			templateContent = templateContent.replace(/\{\{selection\}\}/g, this.selectedText);

			const tokenIndex = templateContent.indexOf('{{cursor}}');
			templateContent = templateContent.slice(0, tokenIndex) + templateContent.slice(tokenIndex + '{{cursor}}'.length);
			promptBox.setText(templateContent);
			promptBox.setSelectionRange(tokenIndex, tokenIndex);
			this.prompt = templateContent
		} else {
			promptBox.setText(this.selectedText);
			promptBox.setSelectionRange(0, this.selectedText.length);
			this.prompt = this.selectedText
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
