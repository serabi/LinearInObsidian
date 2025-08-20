
import { LinearIssueEmbed, EmbedOptions, EmbedFormat } from './issue-embed';
import { LinearIssue } from '../types';
import { debugLogger } from '../debug';

export class LinearEmbedProcessor {
	private plugin: any;
	private issueCache: Map<string, LinearIssue> = new Map();

	constructor(plugin: any) {
		this.plugin = plugin;
	}

	/**
	 * Process linear-issue code blocks
	 */
	async processCodeBlock(
		source: string,
		el: HTMLElement
	): Promise<void> {
		debugLogger.log('Linear Embed', 'Processing code block with source:', source);
		
		// Parse the code block content
		const parsed = this.parseEmbedSource(source.trim());
		if (!parsed) {
			debugLogger.error('Linear Embed', 'Failed to parse embed source:', source);
			el.createDiv({
				text: 'Invalid Linear issue embed syntax',
				cls: 'linear-embed-error'
			});
			return;
		}

		const { issueIdentifier, options } = parsed;
		console.log('[Linear Embed] Parsed embed:', { issueIdentifier, options });

		// Show loading state
		const loadingEl = el.createDiv({
			text: `Loading ${issueIdentifier}...`,
			cls: 'linear-embed-loading'
		});

		try {
			console.log('[Linear Embed] Fetching issue:', issueIdentifier);
			
			// Fetch issue data
			const issue = await this.fetchIssue(issueIdentifier);
			
			if (!issue) {
				console.warn('[Linear Embed] Issue not found:', issueIdentifier);
				loadingEl.remove();
				el.createDiv({
					text: `Issue ${issueIdentifier} not found`,
					cls: 'linear-embed-error'
				});
				return;
			}

			console.log('[Linear Embed] Successfully fetched issue:', {
				identifier: issue.identifier,
				title: issue.title,
				team: issue.team.name,
				state: issue.state.name
			});

			// Remove loading and render embed
			loadingEl.remove();
			const embed = new LinearIssueEmbed(el, issue, options, this.plugin);
			embed.render();

		} catch (error) {
			console.error('[Linear Embed] Error loading issue:', issueIdentifier, error);
			loadingEl.remove();
			el.createDiv({
				text: `Failed to load issue ${issueIdentifier}: ${error.message}`,
				cls: 'linear-embed-error'
			});
		}
	}

	/**
	 * Parse embed source to extract issue identifier and options
	 */
	private parseEmbedSource(source: string): { issueIdentifier: string; options: EmbedOptions } | null {
		console.log('[Linear Embed] Parsing embed source:', JSON.stringify(source));
		
		// Handle various formats:
		// ABC-123
		// ABC-123:card
		// ABC-123:card:showDates=true
		// ABC-123 format=detailed showAssignee=false
		
		const lines = source.split('\n').map(l => l.trim()).filter(l => l);
		console.log('[Linear Embed] Split into lines:', lines);
		
		if (lines.length === 0) {
			console.error('[Linear Embed] No content found in source');
			return null;
		}

		const firstLine = lines[0];
		console.log('[Linear Embed] Processing first line:', firstLine);
		
		let issueIdentifier: string;
		let options: Partial<EmbedOptions> = {};

		// Check for colon-separated format (ABC-123:card:option=value)
		if (firstLine.includes(':')) {
			console.log('[Linear Embed] Detected colon-separated format');
			const parts = firstLine.split(':');
			console.log('[Linear Embed] Split into parts:', parts);
			
			issueIdentifier = parts[0];
			console.log('[Linear Embed] Extracted issue identifier:', issueIdentifier);
			
			if (parts[1]) {
				const format = parts[1].trim() as EmbedFormat;
				console.log('[Linear Embed] Found format (raw):', JSON.stringify(parts[1]));
				console.log('[Linear Embed] Found format (trimmed):', JSON.stringify(format));
				if (['compact', 'card', 'detailed', 'badge', 'progress', 'developer', 'executive'].includes(format)) {
					options.format = format;
					console.log('[Linear Embed] Set format option:', format);
				} else {
					console.warn('[Linear Embed] Invalid format:', format);
					console.warn('[Linear Embed] Available formats:', ['compact', 'card', 'detailed', 'badge', 'progress', 'developer', 'executive']);
				}
			}

			// Parse additional options
			for (let i = 2; i < parts.length; i++) {
				console.log('[Linear Embed] Parsing colon option:', parts[i]);
				const option = this.parseOption(parts[i]);
				if (option) {
					console.log('[Linear Embed] Parsed option:', option);
					Object.assign(options, option);
				}
			}
		} 
		// Check for space-separated format (ABC-123 format=card option=value)
		else {
			console.log('[Linear Embed] Detected space-separated format');
			const parts = firstLine.split(/\s+/);
			console.log('[Linear Embed] Split into parts:', parts);
			
			issueIdentifier = parts[0];
			console.log('[Linear Embed] Extracted issue identifier:', issueIdentifier);
			
			// Parse key=value options
			for (let i = 1; i < parts.length; i++) {
				console.log('[Linear Embed] Parsing space option:', parts[i]);
				const option = this.parseOption(parts[i]);
				if (option) {
					console.log('[Linear Embed] Parsed option:', option);
					Object.assign(options, option);
				}
			}
		}

		// Parse multi-line options
		for (let i = 1; i < lines.length; i++) {
			console.log('[Linear Embed] Parsing multi-line option:', lines[i]);
			const option = this.parseOption(lines[i]);
			if (option) {
				console.log('[Linear Embed] Parsed option:', option);
				Object.assign(options, option);
			}
		}

		console.log('[Linear Embed] Final parsed options:', options);

		// Validate issue identifier format
		const isValid = this.isValidIssueIdentifier(issueIdentifier);
		console.log('[Linear Embed] Issue identifier validation:', issueIdentifier, 'is valid:', isValid);
		
		if (!isValid) {
			console.error('[Linear Embed] Invalid issue identifier format:', issueIdentifier);
			return null;
		}

		const result = {
			issueIdentifier,
			options: options as EmbedOptions
		};

		console.log('[Linear Embed] Successfully parsed embed source:', result);
		return result;
	}

	/**
	 * Parse individual option string (key=value)
	 */
	private parseOption(optionStr: string): Partial<EmbedOptions> | null {
		if (!optionStr.includes('=')) return null;

		const [key, value] = optionStr.split('=', 2);
		const trimmedKey = key.trim();
		const trimmedValue = value.trim();

		switch (trimmedKey) {
			case 'format':
				if (['compact', 'card', 'detailed', 'badge', 'progress', 'developer', 'executive'].includes(trimmedValue)) {
					return { format: trimmedValue as EmbedFormat };
				}
				break;
			
			// Core options
			case 'showDescription':
				return { showDescription: trimmedValue === 'true' };
			case 'showAssignee':
				return { showAssignee: trimmedValue === 'true' };
			case 'showPriority':
				return { showPriority: trimmedValue === 'true' };
			case 'showTeam':
				return { showTeam: trimmedValue === 'true' };
			case 'showDates':
				return { showDates: trimmedValue === 'true' };
			case 'interactive':
				return { interactive: trimmedValue === 'true' };
			
			// Enhanced options
			case 'showCreator':
				return { showCreator: trimmedValue === 'true' };
			case 'showProject':
				return { showProject: trimmedValue === 'true' };
			case 'showCycle':
				return { showCycle: trimmedValue === 'true' };
			case 'showEstimate':
				return { showEstimate: trimmedValue === 'true' };
			case 'showLabels':
				return { showLabels: trimmedValue === 'true' };
			case 'showDueDate':
				return { showDueDate: trimmedValue === 'true' };
			case 'showCommentCount':
				return { showCommentCount: trimmedValue === 'true' };
			case 'showAttachmentCount':
				return { showAttachmentCount: trimmedValue === 'true' };
			case 'showUrl':
				return { showUrl: trimmedValue === 'true' };
			case 'showProgress':
				return { showProgress: trimmedValue === 'true' };
			case 'showRelations':
				return { showRelations: trimmedValue === 'true' };
			case 'showSLA':
				return { showSLA: trimmedValue === 'true' };
			case 'showBranch':
				return { showBranch: trimmedValue === 'true' };
			
			case 'maxDescriptionLength':
				const length = parseInt(trimmedValue, 10);
				if (!isNaN(length) && length > 0) {
					return { maxDescriptionLength: length };
				}
				break;
		}

		return null;
	}

	/**
	 * Check if string is a valid Linear issue identifier
	 */
	private isValidIssueIdentifier(identifier: string): boolean {
		// Linear identifiers follow pattern: 1-10 uppercase letters, dash, 1+ digits
		const pattern = /^[A-Z]{1,10}-\d+$/;
		const isValid = pattern.test(identifier);
		console.log('[Linear Embed] Validating identifier:', identifier, 'against pattern:', pattern.toString(), 'result:', isValid);
		return isValid;
	}

	/**
	 * Fetch issue data with caching
	 */
	private async fetchIssue(issueIdentifier: string): Promise<LinearIssue | null> {
		console.log('[Linear Embed] fetchIssue called for:', issueIdentifier);
		
		// Check cache first
		if (this.issueCache.has(issueIdentifier)) {
			console.log('[Linear Embed] Found issue in cache:', issueIdentifier);
			return this.issueCache.get(issueIdentifier)!;
		}

		console.log('[Linear Embed] Issue not in cache, fetching from API');

		if (!this.plugin.linearService.isConfigured()) {
			console.error('[Linear Embed] Linear API not configured');
			throw new Error('Linear API not configured');
		}

		console.log('[Linear Embed] Linear service is configured, making API call');

		try {
			// Use the more efficient method to get issue by identifier
			console.log('[Linear Embed] Calling getIssueByIdentifier for:', issueIdentifier);
			const issue = await this.plugin.linearService.getIssueByIdentifier(issueIdentifier);

			if (issue) {
				console.log('[Linear Embed] Successfully retrieved issue from API:', {
					identifier: issue.identifier,
					id: issue.id,
					title: issue.title,
					team: issue.team.name
				});
				
				// Cache the issue for future use
				this.issueCache.set(issueIdentifier, issue);
				console.log('[Linear Embed] Cached issue for 5 minutes');
				
				// Cache expires after 5 minutes
				setTimeout(() => {
					console.log('[Linear Embed] Cache expired for:', issueIdentifier);
					this.issueCache.delete(issueIdentifier);
				}, 5 * 60 * 1000);

				return issue;
			}

			console.warn('[Linear Embed] API returned null for issue:', issueIdentifier);
			return null;
		} catch (error) {
			console.error(`[Linear Embed] Failed to fetch issue ${issueIdentifier}:`, error);
			if (error instanceof Error) {
				console.error('[Linear Embed] Error details:', {
					message: error.message,
					stack: error.stack,
					name: error.name
				});
			}
			throw error;
		}
	}

	/**
	 * Clear the issue cache
	 */
	clearCache(): void {
		this.issueCache.clear();
	}

	/**
	 * Refresh cached issue data
	 */
	async refreshIssue(issueIdentifier: string): Promise<LinearIssue | null> {
		this.issueCache.delete(issueIdentifier);
		return await this.fetchIssue(issueIdentifier);
	}
}

/**
 * Add CSS for embed error states
 */
export function addEmbedErrorStyles(): void {
	if (document.querySelector('#linear-embed-error-styles')) {
		return;
	}

	const style = document.createElement('style');
	style.id = 'linear-embed-error-styles';
	style.textContent = `
		.linear-embed-error {
			padding: 0.75rem;
			border: 1px solid var(--color-red);
			border-radius: 4px;
			background: var(--background-secondary);
			color: var(--color-red);
			font-family: var(--font-monospace);
			font-size: 0.9em;
			margin: 0.5rem 0;
		}

		.linear-embed-loading {
			padding: 0.75rem;
			border: 1px solid var(--background-modifier-border);
			border-radius: 4px;
			background: var(--background-secondary);
			color: var(--text-muted);
			font-style: italic;
			margin: 0.5rem 0;
			animation: linear-loading-pulse 1.5s ease-in-out infinite;
		}

		@keyframes linear-loading-pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.5; }
		}
	`;
	document.head.appendChild(style);
}