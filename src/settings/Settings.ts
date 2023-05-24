import { App, PluginSettingTab, Setting, } from 'obsidian';
import GptActionsPlugin from '../../main';
import { FolderSuggest } from './suggesters/FolderSuggester';


export interface Settings {
	openAiApiKey: string;
	modelName: string;
	modelTemperature: number;
	templatesFolder: string;
}

export const DEFAULT_SETTINGS = {
	openAiApiKey: '',
	modelName: 'gpt-3.5-turbo',
	modelTemperature: 0.2,
	templatesFolder: '',
}


export class SettingsTab extends PluginSettingTab {

	constructor(private plugin: GptActionsPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.addHeader('OpenAi Settings');
		this.setting_openAiApiKey();
		this.setting_modelName();
		this.setting_modelTemperature();

		this.addHeader('Template Settings');
		this.setting_templateFolder()
	}

	addHeader(text: string): void {
		this.containerEl.createEl('h2', { text });
	}

	setting_openAiApiKey(): Setting {
		const setting = new Setting(this.containerEl)
			.setName('Enter your OpenAi Api Key')
			.setDesc('This is used to access the OpenAi API.')
			.addText(textComponent => textComponent
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.openAiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openAiApiKey = value;
					await this.plugin.saveSettings();
				}));
		return setting;
	}

	addTextSetting(name: string, description: string, setting: string): Setting {
		const _setting = new Setting(this.containerEl)
			.setName(name)
			.setDesc(description)
			.addText(textComponent => textComponent
				.setPlaceholder('sk-...')
				.setValue(setting)
				.onChange(async (value) => {
					setting = value;
					await this.plugin.saveSettings();
				}));
		return _setting;
	}

	setting_modelName(): void {
		new Setting(this.containerEl)
			.setName('Model Name')
			.setDesc('The name of the model to use.')
			.addText(textComponent => textComponent
				.setPlaceholder('model name')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					this.plugin.settings.modelName = value;
					await this.plugin.saveSettings();
				}));
	}

	setting_modelTemperature(): void {
		new Setting(this.containerEl)
			.setName('Model Temperature')
			.setDesc('The temperature to use when generating text.')
			.addText(textComponent => textComponent
				.setPlaceholder('0.2')
				.setValue(this.plugin.settings.modelTemperature.toString())
				.onChange(async (value) => {
					this.plugin.settings.modelTemperature = parseFloat(value);
					await this.plugin.saveSettings();
				}));
	}

	setting_templateFolder(): void {
		new Setting(this.containerEl)
			.setName("Template folder location")
			.setDesc("Files in this folder will be available as templates.")
			.addSearch((cb) => {
				new FolderSuggest(cb.inputEl)
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.templatesFolder)
					.onChange(async (new_folder) => {
						this.plugin.settings.templatesFolder = new_folder;
						await this.plugin.saveSettings();
					});
				// @ts-ignore
				cb.containerEl.addClass("templater_search");
			});
	}
}
