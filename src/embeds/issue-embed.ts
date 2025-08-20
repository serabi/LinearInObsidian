import { LinearIssue } from '../types';
import { debugLogger } from '../debug';

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

		debugLogger.log('Linear Embed Constructor', 'Creating embed for issue:', this.issue.identifier);
		debugLogger.log('Linear Embed Constructor', 'DEFAULT_EMBED_OPTIONS:', DEFAULT_EMBED_OPTIONS);
		debugLogger.log('Linear Embed Constructor', 'Passed options:', options);
		debugLogger.log('Linear Embed Constructor', 'Final merged options:', this.options);
	}

	render(): void {
		debugLogger.log('Linear Embed Render', 'Starting render for format:', this.options.format);
		debugLogger.log('Linear Embed Render', 'All render options:', this.options);
		
		this.container.empty();
		this.container.addClass('linear-issue-embed');
		this.container.addClass(`linear-embed-${this.options.format}`);

		debugLogger.log('Linear Embed Render', 'Added CSS classes:', ['linear-issue-embed', `linear-embed-${this.options.format}`]);

		switch (this.options.format) {
			case 'compact':
				debugLogger.log('Linear Embed Render', 'Calling renderCompact()');
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
	}

	private renderCompact(): void {
		debugLogger.log('Linear Embed Compact', 'Starting renderCompact for issue:', this.issue.identifier);
		
		const compact = this.container.createDiv('linear-embed-compact');
		debugLogger.log('Linear Embed Compact', 'Created compact container with class:', 'linear-embed-compact');
		
		const header = compact.createDiv('linear-embed-header');
		debugLogger.log('Linear Embed Compact', 'Created header container with class:', 'linear-embed-header');
		
		header.createSpan({
			text: this.issue.identifier,
			cls: 'linear-embed-identifier'
		});
		debugLogger.log('Linear Embed Compact', 'Created identifier span:', this.issue.identifier, 'with class:', 'linear-embed-identifier');

		header.createSpan({
			text: this.issue.title,
			cls: 'linear-embed-title'
		});
		debugLogger.log('Linear Embed Compact', 'Created title span:', this.issue.title, 'with class:', 'linear-embed-title');

		header.createSpan({
			text: this.issue.state.name,
			cls: `linear-embed-state linear-state-${this.issue.state.type}`
		});
		debugLogger.log('Linear Embed Compact', 'Created state span:', this.issue.state.name, 'with classes:', [`linear-embed-state`, `linear-state-${this.issue.state.type}`]);
		
		debugLogger.log('Linear Embed Compact', 'Finished renderCompact - checking final DOM structure');
		debugLogger.log('Linear Embed Compact', 'Compact container HTML:', compact.outerHTML);
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


}