import { App, PluginSettingTab, Setting } from 'obsidian';

export class LinearSettingTab extends PluginSettingTab {
	plugin: any; // Type this properly to avoid circular imports

	constructor(app: App, plugin: any) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Linear Integration Settings' });

		new Setting(containerEl)
			.setName('Linear API Key')
			.setDesc('Your personal Linear API key. You can create one in Linear Settings > Security & Access > API Key.')
			.addText(text => text
				.setPlaceholder('lin_api_...')
				.setValue(this.plugin.settings.linearApiKey)
				.onChange(async (value) => {
					this.plugin.settings.linearApiKey = value;
					await this.plugin.saveSettings();
				}));

		// Debug Mode setting
		new Setting(containerEl)
			.setName('Debug Mode')
			.setDesc('Enable debug logging in the browser console for troubleshooting.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debugMode)
				.onChange(async (value) => {
					this.plugin.settings.debugMode = value;
					await this.plugin.saveSettings();
				}));

		// Test connection section
		containerEl.createEl('h3', { text: 'Connection Test' });
		
		const testContainer = containerEl.createDiv();
		const testButton = testContainer.createEl('button', { text: 'Test Linear Connection' });
		const statusEl = testContainer.createEl('p', { cls: 'linear-connection-status' });

		testButton.onclick = async () => {
			if (!this.plugin.settings.linearApiKey) {
				statusEl.setText('Please enter your Linear API key first.');
				statusEl.className = 'linear-connection-status error';
				return;
			}

			testButton.disabled = true;
			testButton.setText('Testing...');
			statusEl.setText('');

			try {
				await this.plugin.linearService.testConnection();
				statusEl.setText('✅ Connection successful!');
				statusEl.className = 'linear-connection-status success';
			} catch (error) {
				statusEl.setText(`❌ Connection failed: ${error.message}`);
				statusEl.className = 'linear-connection-status error';
			} finally {
				testButton.disabled = false;
				testButton.setText('Test Linear Connection');
			}
		};
	}
}