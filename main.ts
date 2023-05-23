import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	Settings,
	SettingsTab
} from 'settings/Settings'

import CommandHandler from 'handlers/CommandHandler';

export default class GptActionsPlugin extends Plugin {
	public settings: Settings;

	async onload() {
		await this.loadSettings();

		new CommandHandler(this).registerCommands();
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
