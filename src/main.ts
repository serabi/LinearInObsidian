import { Plugin, Notice } from 'obsidian';
import { LinearPluginSettings, DEFAULT_SETTINGS } from './types';
import { LinearSettingTab } from './settings';
import { LinearService } from './linear-service';
import { LinearEmbedProcessor, addEmbedErrorStyles } from './embeds/code-block-processor';
import { debugLogger } from './debug';

export default class LinearPlugin extends Plugin {
	settings: LinearPluginSettings;
	linearService: LinearService;
	embedProcessor: LinearEmbedProcessor;
	private statusBarItem: HTMLElement;

	async onload() {
		await this.loadSettings();
		
		this.linearService = new LinearService(this.settings.linearApiKey);
		this.embedProcessor = new LinearEmbedProcessor(this);

		// Add embed-related commands only
		this.addCommand({
			id: 'insert-linear-embed',
			name: 'Insert Linear Issue Embed',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:card\n```';
				editor.replaceSelection(template);
				new Notice('Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		this.addCommand({
			id: 'insert-linear-embed-compact',
			name: 'Insert Linear Issue Embed (Compact)',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:compact\n```';
				editor.replaceSelection(template);
				new Notice('Compact Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		this.addCommand({
			id: 'insert-linear-embed-detailed',
			name: 'Insert Linear Issue Embed (Detailed)',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:detailed\n```';
				editor.replaceSelection(template);
				new Notice('Detailed Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		this.addCommand({
			id: 'insert-linear-embed-badge',
			name: 'Insert Linear Issue Embed (Badge)',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:badge\n```';
				editor.replaceSelection(template);
				new Notice('Badge Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		this.addCommand({
			id: 'insert-linear-embed-progress',
			name: 'Insert Linear Issue Embed (Progress)',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:progress\n```';
				editor.replaceSelection(template);
				new Notice('Progress Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		this.addCommand({
			id: 'insert-linear-embed-developer',
			name: 'Insert Linear Issue Embed (Developer)',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:developer\n```';
				editor.replaceSelection(template);
				new Notice('Developer Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		this.addCommand({
			id: 'insert-linear-embed-executive',
			name: 'Insert Linear Issue Embed (Executive)',
			editorCallback: async (editor) => {
				const template = '```linear-issue\nABC-123:executive\n```';
				editor.replaceSelection(template);
				new Notice('Executive Linear embed template inserted. Replace ABC-123 with your issue identifier.');
			}
		});

		// Debug command for troubleshooting
		this.addCommand({
			id: 'debug-linear-issues',
			name: 'Debug: List Available Linear Issues',
			callback: async () => {
				console.log('[Linear Debug] Starting debug command');
				if (!this.linearService.isConfigured()) {
					new Notice('Linear API not configured');
					console.error('[Linear Debug] Linear service not configured');
					return;
				}

				try {
					console.log('[Linear Debug] Fetching all issues for debugging');
					const issues = await this.linearService.getIssues({ first: 50 });
					console.log('[Linear Debug] Retrieved', issues.length, 'issues');
					
					console.group('[Linear Debug] Available Issue Identifiers:');
					issues.forEach((issue, index) => {
						console.log(`${index + 1}. ${issue.identifier} - "${issue.title}" (Team: ${issue.team.name})`);
					});
					console.groupEnd();

					new Notice(`Found ${issues.length} issues. Check console for detailed list.`);
				} catch (error) {
					console.error('[Linear Debug] Error fetching issues:', error);
					new Notice(`Error fetching issues: ${error.message}`);
				}
			}
		});

		// Add settings tab
		this.addSettingTab(new LinearSettingTab(this.app, this));

		// Register code block processor for embeds
		this.registerMarkdownCodeBlockProcessor('linear-issue', (source, el) => {
			this.embedProcessor.processCodeBlock(source, el);
		});

		// Add embed styles
		addEmbedErrorStyles();

		// Add status bar item
		this.statusBarItem = this.addStatusBarItem();
		this.updateStatusBar();

		console.log('Linear in Obsidian plugin loaded');
	}

	private updateStatusBar() {
		if (!this.statusBarItem) return;

		if (this.linearService.isConfigured()) {
			this.statusBarItem.setText('Linear: Connected');
			this.statusBarItem.title = 'Linear plugin is connected and ready';
		} else {
			this.statusBarItem.setText('Linear: Not configured');
			this.statusBarItem.title = 'Linear API key not configured';
		}
	}

	onunload() {
		console.log('Linear in Obsidian plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		
		// Update debug logger with current setting
		debugLogger.setDebugMode(this.settings.debugMode);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// Update Linear service with new API key
		this.linearService.setApiKey(this.settings.linearApiKey);
		
		// Update debug logger with new setting
		debugLogger.setDebugMode(this.settings.debugMode);
		
		// Update status bar
		this.updateStatusBar();
	}
}