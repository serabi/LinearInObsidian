import { LinearIssue } from '../types';

export type EmbedFormat = 'compact' | 'card' | 'detailed' | 'badge' | 'progress' | 'developer' | 'executive';

export interface EmbedOptions {
	format: EmbedFormat;
	showDescription?: boolean;
	showAssignee?: boolean;
	showPriority?: boolean;
	showTeam?: boolean;
	showDates?: boolean;
	interactive?: boolean;
	maxDescriptionLength?: number;
	
	// Enhanced display options
	showCreator?: boolean;           // Show who created the issue
	showProject?: boolean;           // Show associated project
	showCycle?: boolean;             // Show development cycle
	showEstimate?: boolean;          // Show story points
	showLabels?: boolean;            // Show issue labels
	showDueDate?: boolean;           // Show due date if set
	showCommentCount?: boolean;      // Show number of comments
	showAttachmentCount?: boolean;   // Show number of attachments
	showUrl?: boolean;               // Show Linear URL
	showProgress?: boolean;          // Show project/cycle progress
	showRelations?: boolean;         // Show related issues
	showSLA?: boolean;               // Show SLA status
	showBranch?: boolean;            // Show git branch name
}

export const DEFAULT_EMBED_OPTIONS: EmbedOptions = {
	format: 'card',
	showDescription: true,
	showAssignee: true,
	showPriority: true,
	showTeam: true,
	showDates: false,
	interactive: true,
	maxDescriptionLength: 150,
	
	// Enhanced defaults
	showCreator: false,
	showProject: false,
	showCycle: false,
	showEstimate: false,
	showLabels: false,
	showDueDate: false,
	showCommentCount: false,
	showAttachmentCount: false,
	showUrl: false,
	showProgress: false,
	showRelations: false,
	showSLA: false,
	showBranch: false
};

export class LinearIssueEmbed {
	private container: HTMLElement;
	private issue: LinearIssue;
	private options: EmbedOptions;
	private plugin: any;

	constructor(container: HTMLElement, issue: LinearIssue, options: EmbedOptions, plugin: any) {
		this.container = container;
		this.issue = issue;
		this.options = { ...DEFAULT_EMBED_OPTIONS, ...options };
		this.plugin = plugin;
	}

	render(): void {
		this.container.empty();
		this.container.addClass('linear-issue-embed');
		this.container.addClass(`linear-embed-${this.options.format}`);

		switch (this.options.format) {
			case 'compact':
				this.renderCompact();
				break;
			case 'badge':
				this.renderBadge();
				break;
			case 'detailed':
				this.renderDetailed();
				break;
			case 'progress':
				this.renderProgress();
				break;
			case 'developer':
				this.renderDeveloper();
				break;
			case 'executive':
				this.renderExecutive();
				break;
			case 'card':
			default:
				this.renderCard();
				break;
		}

		if (this.options.interactive) {
			this.addInteractiveElements();
		}

		this.addStyles();
	}

	private renderCompact(): void {
		const compact = this.container.createDiv('linear-embed-compact');
		
		const header = compact.createDiv('linear-embed-header');
		
		header.createSpan({
			text: this.issue.identifier,
			cls: 'linear-embed-identifier'
		});

		header.createSpan({
			text: this.issue.title,
			cls: 'linear-embed-title'
		});

		header.createSpan({
			text: this.issue.state.name,
			cls: `linear-embed-state linear-state-${this.issue.state.type}`
		});
	}

	private renderBadge(): void {
		const badge = this.container.createDiv('linear-embed-badge');
		
		badge.createSpan({
			text: this.issue.identifier,
			cls: 'linear-badge-identifier'
		});

		badge.createSpan({
			text: this.issue.state.name,
			cls: `linear-badge-state linear-state-${this.issue.state.type}`
		});
	}

	private renderCard(): void {
		const card = this.container.createDiv('linear-embed-card');
		
		// Header
		const header = card.createDiv('linear-embed-card-header');
		
		header.createSpan({
			text: this.issue.identifier,
			cls: 'linear-embed-identifier'
		});

		if (this.options.showPriority && this.issue.priority > 0) {
			header.createSpan({
				text: `P${this.issue.priority}`,
				cls: `linear-embed-priority linear-priority-${this.issue.priority}`
			});
		}

		// Title
		card.createDiv({
			text: this.issue.title,
			cls: 'linear-embed-card-title'
		});

		// Meta info
		const meta = card.createDiv('linear-embed-card-meta');
		
		if (this.options.showTeam) {
			meta.createSpan({
				text: this.issue.team.name,
				cls: 'linear-embed-team'
			});
		}

		meta.createSpan({
			text: this.issue.state.name,
			cls: `linear-embed-state linear-state-${this.issue.state.type}`
		});

		if (this.options.showAssignee && this.issue.assignee) {
			meta.createSpan({
				text: this.issue.assignee.name,
				cls: 'linear-embed-assignee'
			});
		}

		if (this.options.showCreator && this.issue.creator) {
			meta.createSpan({
				text: `Created by ${this.issue.creator.name}`,
				cls: 'linear-embed-creator'
			});
		}

		if (this.options.showProject && this.issue.project) {
			meta.createSpan({
				text: this.issue.project.name,
				cls: 'linear-embed-project'
			});
		}

		if (this.options.showCycle && this.issue.cycle) {
			meta.createSpan({
				text: this.issue.cycle.name,
				cls: 'linear-embed-cycle'
			});
		}

		if (this.options.showEstimate && this.issue.estimate && this.issue.estimate > 0) {
			meta.createSpan({
				text: `${this.issue.estimate} pts`,
				cls: 'linear-embed-estimate'
			});
		}

		// Description - Enhanced debugging
		console.log('[Linear Embed] Description debug for', this.issue.identifier, {
			showDescription: this.options.showDescription,
			hasDescription: !!this.issue.description,
			descriptionType: typeof this.issue.description,
			descriptionLength: this.issue.description ? this.issue.description.length : 0,
			descriptionPreview: this.issue.description ? this.issue.description.substring(0, 50) + '...' : 'NO DESCRIPTION'
		});
		
		if (this.options.showDescription && this.issue.description && typeof this.issue.description === 'string') {
			console.log('[Linear Embed] Rendering description for', this.issue.identifier);
			const description = this.issue.description.length > (this.options.maxDescriptionLength || 150)
				? this.issue.description.substring(0, this.options.maxDescriptionLength || 150) + '...'
				: this.issue.description;
				
			card.createDiv({
				text: description,
				cls: 'linear-embed-description'
			});
		} else {
			console.log('[Linear Embed] NOT rendering description for', this.issue.identifier, 'because:', {
				showDescription: this.options.showDescription,
				hasDescription: !!this.issue.description,
				reason: !this.options.showDescription ? 'showDescription=false' : 
				       !this.issue.description ? 'No description in issue' : 'Unknown'
			});
		}

		// Labels
		if (this.options.showLabels && this.issue.labels && Array.isArray(this.issue.labels) && this.issue.labels.length > 0) {
			const labelsContainer = card.createDiv('linear-embed-labels');
			this.issue.labels.forEach(label => {
				const labelSpan = labelsContainer.createSpan({
					text: label.name,
					cls: 'linear-embed-label'
				});
				labelSpan.style.backgroundColor = label.color;
				labelSpan.style.color = this.getContrastColor(label.color);
			});
		}

		// Due Date
		if (this.options.showDueDate && this.issue.dueDate) {
			const dueDate = card.createDiv('linear-embed-due-date');
			const date = new Date(this.issue.dueDate);
			const isOverdue = date < new Date();
			dueDate.createSpan({
				text: `Due: ${date.toLocaleDateString()}`,
				cls: `linear-embed-due ${isOverdue ? 'linear-embed-overdue' : ''}`
			});
		}

		// Branch Name
		if (this.options.showBranch && this.issue.branchName) {
			const branch = card.createDiv('linear-embed-branch');
			branch.createSpan({
				text: `Branch: ${this.issue.branchName}`,
				cls: 'linear-embed-branch-name'
			});
		}

		// Comment and Attachment counts
		if ((this.options.showCommentCount && this.issue.comments) || 
			(this.options.showAttachmentCount && this.issue.attachments)) {
			const counts = card.createDiv('linear-embed-counts');
			
			if (this.options.showCommentCount && this.issue.comments && Array.isArray(this.issue.comments)) {
				counts.createSpan({
					text: `💬 ${this.issue.comments.length}`,
					cls: 'linear-embed-comment-count'
				});
			}
			
			if (this.options.showAttachmentCount && this.issue.attachments && Array.isArray(this.issue.attachments)) {
				counts.createSpan({
					text: `📎 ${this.issue.attachments.length}`,
					cls: 'linear-embed-attachment-count'
				});
			}
		}

		// URL
		if (this.options.showUrl) {
			const urlDiv = card.createDiv('linear-embed-url');
			const link = urlDiv.createEl('a', {
				text: this.issue.url || `https://linear.app/issue/${this.issue.identifier}`,
				cls: 'linear-embed-link'
			});
			link.href = this.issue.url || `https://linear.app/issue/${this.issue.identifier}`;
			link.target = '_blank';
		}

		// Dates
		if (this.options.showDates) {
			const dates = card.createDiv('linear-embed-dates');
			dates.createSpan({
				text: `Created: ${new Date(this.issue.createdAt).toLocaleDateString()}`,
				cls: 'linear-embed-date'
			});
			
			if (this.issue.updatedAt !== this.issue.createdAt) {
				dates.createSpan({
					text: `Updated: ${new Date(this.issue.updatedAt).toLocaleDateString()}`,
					cls: 'linear-embed-date'
				});
			}
		}
	}

	private renderDetailed(): void {
		// Use card rendering as base
		this.renderCard();
		
		// Add extra details
		const card = this.container.querySelector('.linear-embed-card');
		if (card) {
			card.addClass('linear-embed-detailed');
			
			// Add full description if available
			if (this.issue.description) {
				const fullDesc = card.createDiv({
					cls: 'linear-embed-full-description'
				});
				fullDesc.innerHTML = this.markdownToHtml(this.issue.description);
			}

			// Add project info if available
			if (this.issue.project) {
				const project = card.createDiv('linear-embed-project');
				project.createSpan({ text: 'Project: ' });
				project.createSpan({
					text: this.issue.project.name,
					cls: 'linear-embed-project-name'
				});
			}
		}
	}

	private renderProgress(): void {
		// This would be for issues with sub-tasks or progress tracking
		// For now, render as card with progress indicator
		this.renderCard();
		
		const card = this.container.querySelector('.linear-embed-card');
		if (card) {
			// Add a simple progress indicator based on state
			const progressBar = card.createDiv('linear-embed-progress');
			const progress = this.getProgressPercentage();
			
			const bar = progressBar.createDiv('linear-progress-bar');
			const fill = bar.createDiv('linear-progress-fill');
			fill.style.width = `${progress}%`;
			
			progressBar.createSpan({
				text: `${progress}% Complete`,
				cls: 'linear-progress-text'
			});
		}
	}

	private renderDeveloper(): void {
		// Developer-focused format with technical details
		const developerOptions = {
			...this.options,
			showAssignee: true,
			showLabels: true,
			showBranch: true,
			showCommentCount: true,
			showAttachmentCount: true,
			showEstimate: true,
			showProject: true,
			showDates: true
		};
		const originalOptions = this.options;
		this.options = developerOptions;
		this.renderCard();
		this.options = originalOptions;
	}

	private renderExecutive(): void {
		// Executive-focused format with high-level details
		const executiveOptions = {
			...this.options,
			showProject: true,
			showProgress: true,
			showDueDate: true,
			showTeam: true,
			showAssignee: true,
			showPriority: true,
			showDescription: false, // Keep it concise
			maxDescriptionLength: 80
		};
		const originalOptions = this.options;
		this.options = executiveOptions;
		this.renderCard();
		this.options = originalOptions;
	}

	private addInteractiveElements(): void {
		// Add click handler to open in Linear
		this.container.onclick = (e) => {
			if ((e.target as HTMLElement).closest('.linear-embed-action')) {
				return; // Don't trigger if clicking on action buttons
			}
			window.open(`https://linear.app/issue/${this.issue.identifier}`, '_blank');
		};

		this.container.style.cursor = 'pointer';
		this.container.title = `Click to open ${this.issue.identifier} in Linear`;

		// Add refresh button for certain formats
		if (this.options.format === 'card' || this.options.format === 'detailed') {
			const actions = this.container.createDiv('linear-embed-actions');

			const refreshBtn = actions.createEl('button', {
				text: '↻',
				cls: 'linear-embed-action linear-embed-refresh'
			});
			refreshBtn.title = 'Refresh issue data';
			
			refreshBtn.onclick = (e) => {
				e.stopPropagation();
				this.refreshIssue();
			};
		}
	}

	private async refreshIssue(): Promise<void> {
		try {
			// Fetch fresh issue data by identifier
			const updatedIssue = await this.plugin.linearService.getIssueByIdentifier(this.issue.identifier);
			
			if (updatedIssue) {
				this.issue = updatedIssue;
				this.render(); // Re-render with fresh data
			}
		} catch (error) {
			console.error('Failed to refresh issue:', error);
		}
	}

	private getProgressPercentage(): number {
		// Simple progress based on state type
		switch (this.issue.state.type) {
			case 'unstarted': return 0;
			case 'started': return 50;
			case 'completed': return 100;
			case 'canceled': return 0;
			default: return 25;
		}
	}

	private markdownToHtml(markdown: string): string {
		// Simple markdown to HTML conversion
		return markdown
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/`(.*?)`/g, '<code>$1</code>')
			.replace(/\n/g, '<br>');
	}

	private getContrastColor(hexColor: string): string {
		// Remove # if present
		const hex = hexColor.replace('#', '');
		
		// Convert to RGB
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		
		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		
		// Return black or white based on luminance
		return luminance > 0.5 ? '#000000' : '#ffffff';
	}

	private addStyles(): void {
		// Only add styles if not already added
		if (document.querySelector('#linear-embed-styles')) {
			return;
		}

		const style = document.createElement('style');
		style.id = 'linear-embed-styles';
		style.textContent = `
			.linear-issue-embed {
				margin: 0.5rem 0;
				font-family: var(--font-interface);
			}

			.linear-embed-compact {
				display: flex;
				align-items: center;
				gap: 1rem;
				padding: 0.5rem;
				border: 1px solid var(--background-modifier-border);
				border-radius: 4px;
				background: var(--background-secondary);
			}

			.linear-embed-badge {
				display: inline-flex;
				align-items: center;
				gap: 0.25rem;
				padding: 0.25rem 0.5rem;
				border-radius: 12px;
				background: var(--background-modifier-border);
				font-size: 0.8em;
			}

			.linear-embed-card {
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				padding: 1rem;
				background: var(--background-secondary);
				transition: all 0.2s ease;
			}

			.linear-embed-card:hover {
				border-color: var(--text-accent);
				transform: translateY(-1px);
				box-shadow: 0 2px 8px rgba(0,0,0,0.1);
			}

			.linear-embed-detailed {
				max-width: none;
			}

			.linear-embed-card-header {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				margin-bottom: 0.5rem;
			}

			.linear-embed-identifier {
				font-family: var(--font-monospace);
				font-weight: bold;
				color: var(--text-accent);
				font-size: 0.9em;
			}

			.linear-badge-identifier {
				font-family: var(--font-monospace);
				font-weight: bold;
				font-size: 0.8em;
			}

			.linear-embed-card-title {
				font-weight: 600;
				font-size: 1.1em;
				margin-bottom: 0.5rem;
				line-height: 1.3;
			}

			.linear-embed-title {
				font-weight: 500;
				flex-grow: 1;
			}

			.linear-embed-card-meta {
				display: flex;
				gap: 0.5rem;
				margin-bottom: 0.75rem;
				flex-wrap: wrap;
			}

			.linear-embed-card-meta > span {
				padding: 0.2rem 0.4rem;
				border-radius: 3px;
				font-size: 0.8em;
				background: var(--background-modifier-border);
			}

			.linear-embed-description {
				color: var(--text-muted);
				font-size: 0.9em;
				line-height: 1.4;
				margin-bottom: 0.5rem;
			}

			.linear-embed-full-description {
				color: var(--text-muted);
				font-size: 0.9em;
				line-height: 1.5;
				margin-top: 0.75rem;
				padding-top: 0.75rem;
				border-top: 1px solid var(--background-modifier-border);
			}

			.linear-embed-dates {
				display: flex;
				gap: 1rem;
				font-size: 0.8em;
				color: var(--text-muted);
				margin-top: 0.5rem;
			}

			.linear-embed-project {
				margin-top: 0.5rem;
				font-size: 0.9em;
			}

			.linear-embed-project-name {
				font-weight: 500;
				color: var(--text-accent);
			}

			.linear-embed-actions {
				display: flex;
				gap: 0.5rem;
				margin-top: 0.75rem;
				padding-top: 0.75rem;
				border-top: 1px solid var(--background-modifier-border);
			}

			.linear-embed-action {
				padding: 0.3rem 0.6rem;
				border: 1px solid var(--background-modifier-border);
				border-radius: 4px;
				background: var(--background-primary);
				color: var(--text-normal);
				cursor: pointer;
				font-size: 0.8em;
				transition: all 0.2s ease;
			}

			.linear-embed-action:hover {
				background: var(--background-modifier-hover);
				border-color: var(--text-accent);
			}

			.linear-embed-progress {
				margin-top: 0.75rem;
			}

			.linear-progress-bar {
				height: 6px;
				background: var(--background-modifier-border);
				border-radius: 3px;
				overflow: hidden;
				margin-bottom: 0.25rem;
			}

			.linear-progress-fill {
				height: 100%;
				background: linear-gradient(90deg, var(--color-blue), var(--color-green));
				transition: width 0.3s ease;
			}

			.linear-progress-text {
				font-size: 0.8em;
				color: var(--text-muted);
			}

			/* State-specific styling */
			.linear-state-unstarted { background: var(--background-modifier-border) !important; color: var(--text-muted); }
			.linear-state-started { background: var(--color-blue) !important; color: white; }
			.linear-state-completed { background: var(--color-green) !important; color: white; }
			.linear-state-canceled { background: var(--color-red) !important; color: white; }

			.linear-priority-1 { background: var(--color-red) !important; color: white; }
			.linear-priority-2 { background: var(--color-orange) !important; color: white; }
			.linear-priority-3 { background: var(--color-yellow) !important; }
			.linear-priority-4 { background: var(--background-modifier-border) !important; }

			/* Badge specific styles */
			.linear-badge-state {
				padding: 0.2rem 0.4rem;
				border-radius: 8px;
				font-size: 0.75em;
				font-weight: 500;
			}

			/* New enhanced styles */
			.linear-embed-labels {
				display: flex;
				gap: 0.25rem;
				margin: 0.5rem 0;
				flex-wrap: wrap;
			}

			.linear-embed-label {
				padding: 0.2rem 0.5rem;
				border-radius: 12px;
				font-size: 0.75em;
				font-weight: 500;
				border: 1px solid rgba(255, 255, 255, 0.2);
			}

			.linear-embed-due-date {
				margin: 0.5rem 0;
				font-size: 0.9em;
			}

			.linear-embed-due {
				padding: 0.3rem 0.6rem;
				border-radius: 4px;
				background: var(--background-modifier-border);
			}

			.linear-embed-overdue {
				background: var(--color-red) !important;
				color: white !important;
			}

			.linear-embed-branch {
				margin: 0.5rem 0;
				font-size: 0.85em;
				color: var(--text-muted);
			}

			.linear-embed-branch-name {
				font-family: var(--font-monospace);
				background: var(--background-modifier-border);
				padding: 0.2rem 0.4rem;
				border-radius: 3px;
			}

			.linear-embed-counts {
				display: flex;
				gap: 1rem;
				margin: 0.5rem 0;
				font-size: 0.85em;
			}

			.linear-embed-comment-count,
			.linear-embed-attachment-count {
				color: var(--text-muted);
			}

			.linear-embed-url {
				margin: 0.5rem 0;
				font-size: 0.85em;
			}

			.linear-embed-link {
				color: var(--text-accent);
				text-decoration: none;
				font-family: var(--font-monospace);
			}

			.linear-embed-link:hover {
				text-decoration: underline;
			}

			.linear-embed-creator,
			.linear-embed-project,
			.linear-embed-cycle,
			.linear-embed-estimate {
				font-size: 0.8em;
			}

			.linear-embed-estimate {
				background: var(--color-blue) !important;
				color: white !important;
				font-weight: 600;
			}
		`;
		document.head.appendChild(style);
	}
}