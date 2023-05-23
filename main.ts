import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	Settings,
	SettingsTab
} from 'settings/Settings'

import CommandHandler from 'handlers/CommandHandler';
import { FuzzySuggester } from 'handlers/FuzzySuggestHandler';

export default class GptActionsPlugin extends Plugin {
	public settings: Settings;
	public commandHandler: CommandHandler;
	public fuzzySuggester: FuzzySuggester;

	async onload() {
		await this.loadSettings();

		this.commandHandler = new CommandHandler(this)
		this.fuzzySuggester = new FuzzySuggester(this)

		this.commandHandler.registerCommands()

		this.addSettingTab(new SettingsTab(this));
	}

	onunload() {
		this.saveSettings()
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
