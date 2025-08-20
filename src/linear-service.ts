import { LinearClient, LinearError } from '@linear/sdk';
import { LinearIssue, LinearTeam, LinearUser } from './types';
import { debugLogger } from './debug';

export class LinearService {
	private client: LinearClient | null = null;
	private apiKey: string = '';

	constructor(apiKey?: string) {
		if (apiKey) {
			this.setApiKey(apiKey);
		}
	}

	setApiKey(apiKey: string): void {
		this.apiKey = apiKey;
		if (apiKey) {
			this.client = new LinearClient({ apiKey });
		} else {
			this.client = null;
		}
	}

	isConfigured(): boolean {
		return !!this.client && !!this.apiKey;
	}

	async testConnection(): Promise<LinearUser> {
		if (!this.client) {
			throw new Error('Linear client not configured. Please set your API key.');
		}

		try {
			const viewer = await this.client.viewer;
			return {
				id: viewer.id,
				name: viewer.name,
				displayName: viewer.displayName,
				email: viewer.email
			};
		} catch (error) {
			if (error instanceof LinearError) {
				throw new Error(`Linear API error: ${error.message}`);
			}
			throw error;
		}
	}

	async getTeams(): Promise<LinearTeam[]> {
		if (!this.client) {
			throw new Error('Linear client not configured');
		}

		try {
			const teams = await this.client.teams({
				first: 50
			});

			return teams.nodes.map(team => ({
				id: team.id,
				name: team.name,
				key: team.key,
				description: team.description || undefined
			}));
		} catch (error) {
			if (error instanceof LinearError) {
				throw new Error(`Failed to fetch teams: ${error.message}`);
			}
			throw error;
		}
	}

	async getIssues(options?: {
		teamId?: string;
		assigneeId?: string;
		projectId?: string;
		stateType?: string;
		first?: number;
	}): Promise<LinearIssue[]> {
		if (!this.client) {
			throw new Error('Linear client not configured');
		}

		try {
			const filter: any = {};
			
			if (options?.teamId) {
				filter.team = { id: { eq: options.teamId } };
			}
			
			if (options?.assigneeId) {
				filter.assignee = { id: { eq: options.assigneeId } };
			}
			
			if (options?.projectId) {
				filter.project = { id: { eq: options.projectId } };
			}
			
			if (options?.stateType) {
				filter.state = { type: { eq: options.stateType } };
			}

			const issues = await this.client.issues({
				first: options?.first || 50,
				filter: Object.keys(filter).length > 0 ? filter : undefined
			});

			return await Promise.all(issues.nodes.map(async issue => {
				return await this.buildIssueObject(issue);
			}));
		} catch (error) {
			if (error instanceof LinearError) {
				throw new Error(`Failed to fetch issues: ${error.message}`);
			}
			throw error;
		}
	}



	private extractTeamKeyFromIdentifier(identifier: string): string | null {
		// Extract team key from identifier (e.g., "HAPD" from "HAPD-1948")
		const match = identifier.match(/^([A-Z]+)-\d+$/);
		return match ? match[1] : null;
	}

	async getTeamByKey(teamKey: string): Promise<LinearTeam | null> {
		debugLogger.log('Linear Service', 'getTeamByKey called for team key:', teamKey);
		
		if (!this.client) {
			throw new Error('Linear client not configured');
		}

		try {
			// STRATEGY 1: Try to find team in first 200 teams (most efficient)
			debugLogger.log('Linear Service', 'Fetching first 200 teams to find:', teamKey);
			const teams = await this.client.teams({ first: 200 });
			
			console.log('[Linear Service] Retrieved', teams.nodes.length, 'teams in first batch');
			console.log('[Linear Service] Sample team keys:', teams.nodes.slice(0, 10).map(t => t.key).join(', '), '...');
			
			let matchingTeam = teams.nodes.find(team => team.key === teamKey);
			
			if (matchingTeam) {
				console.log('[Linear Service] Found team in first batch:', { id: matchingTeam.id, name: matchingTeam.name, key: matchingTeam.key });
				return {
					id: matchingTeam.id,
					name: matchingTeam.name,
					key: matchingTeam.key,
					description: matchingTeam.description || undefined
				};
			}

			// STRATEGY 2: Paginate through all teams if not found in first 200
			console.log('[Linear Service] Team not found in first 200, starting comprehensive pagination search');
			
			const pageInfo = teams.pageInfo;
			if (!pageInfo.hasNextPage) {
				console.warn('[Linear Service] No more teams available, team not found:', teamKey);
				return null;
			}

			let cursor = pageInfo.endCursor;
			let batchCount = 1;
			const maxTeamBatches = 20; // Limit to prevent infinite loops (4000 teams max)

			while (cursor && batchCount < maxTeamBatches) {
				console.log('[Linear Service] Fetching team batch', batchCount + 1, 'starting from cursor');
				
				const nextTeams = await this.client.teams({ first: 200, after: cursor });
				const batch = nextTeams.nodes;
				
				console.log('[Linear Service] Retrieved', batch.length, 'teams in batch', batchCount + 1);
				
				// Check if our team is in this batch
				matchingTeam = batch.find(team => team.key === teamKey);
				if (matchingTeam) {
					console.log('[Linear Service] Found team via pagination:', { id: matchingTeam.id, name: matchingTeam.name, key: matchingTeam.key });
					return {
						id: matchingTeam.id,
						name: matchingTeam.name,
						key: matchingTeam.key,
						description: matchingTeam.description || undefined
					};
				}

				// Check if we have more pages
				const nextPageInfo = nextTeams.pageInfo;
				if (!nextPageInfo.hasNextPage) {
					console.log('[Linear Service] Reached end of teams, no more pages available');
					break;
				}
				
				cursor = nextPageInfo.endCursor;
				batchCount++;
			}

			if (batchCount >= maxTeamBatches) {
				console.warn('[Linear Service] Reached maximum team batch limit (', maxTeamBatches, '), search may be incomplete');
			}

			console.warn('[Linear Service] Team not found after comprehensive search:', teamKey);
			return null;
			
		} catch (error) {
			console.error('[Linear Service] Error in getTeamByKey:', error);
			if (error instanceof LinearError) {
				throw new Error(`Failed to fetch team ${teamKey}: ${error.message}`);
			}
			throw error;
		}
	}

	async getTeamIssues(teamId: string, first: number = 100): Promise<any[]> {
		console.log('[Linear Service] getTeamIssues called for team:', teamId, 'first:', first);
		
		if (!this.client) {
			throw new Error('Linear client not configured');
		}

		try {
			const issues = await this.client.issues({
				first,
				filter: {
					team: { id: { eq: teamId } }
				}
			});
			
			console.log('[Linear Service] Retrieved', issues.nodes.length, 'issues for team', teamId);
			console.log('[Linear Service] Team issue identifiers:', issues.nodes.map(i => i.identifier).join(', '));
			
			return issues.nodes;
		} catch (error) {
			console.error('[Linear Service] Error in getTeamIssues:', error);
			if (error instanceof LinearError) {
				throw new Error(`Failed to fetch team issues: ${error.message}`);
			}
			throw error;
		}
	}

	async getTeamIssuesEnhanced(teamId: string): Promise<any[]> {
		console.log('[Linear Service] getTeamIssuesEnhanced called for team:', teamId);
		
		if (!this.client) {
			throw new Error('Linear client not configured');
		}

		try {
			// Strategy: Search with pagination and enhanced ordering to find older issues
			let allIssues: any[] = [];
			let cursor: string | undefined;
			let searchCompleted = false;
			const batchSize = 200; // Larger batches for efficiency
			const maxBatches = 20; // Up to 4000 team issues
			let batchCount = 0;

			while (!searchCompleted && batchCount < maxBatches) {
				console.log('[Linear Service] Fetching enhanced team issues batch', batchCount + 1);
				
				const issuesQuery: any = {
					first: batchSize,
					filter: {
						team: { id: { eq: teamId } }
					}
				};
				
				if (cursor) {
					issuesQuery.after = cursor;
				}
				
				const issues = await this.client.issues(issuesQuery);
				const batch = issues.nodes;
				
				console.log('[Linear Service] Retrieved', batch.length, 'enhanced team issues in batch', batchCount + 1);
				allIssues.push(...batch);
				
				// Check if we have more pages
				const pageInfo = issues.pageInfo;
				if (!pageInfo.hasNextPage) {
					searchCompleted = true;
					console.log('[Linear Service] Reached end of team issues, no more pages');
				} else {
					cursor = pageInfo.endCursor;
					console.log('[Linear Service] More team issue pages available, continuing search');
				}
				
				batchCount++;
			}

			if (batchCount >= maxBatches) {
				console.warn('[Linear Service] Reached maximum team batch limit (', maxBatches, '), search may be incomplete');
			}

			console.log('[Linear Service] Enhanced team search retrieved total', allIssues.length, 'issues');
			console.log('[Linear Service] Sample identifiers:', allIssues.slice(0, 5).map(i => i.identifier).join(', '));
			
			return allIssues;
		} catch (error) {
			console.error('[Linear Service] Error in getTeamIssuesEnhanced:', error);
			if (error instanceof LinearError) {
				throw new Error(`Failed to fetch enhanced team issues: ${error.message}`);
			}
			throw error;
		}
	}

	async getIssueByIdentifier(identifier: string): Promise<LinearIssue | null> {
		console.log('[Linear Service] getIssueByIdentifier called for:', identifier);
		
		if (!this.client) {
			console.error('[Linear Service] Linear client not configured');
			throw new Error('Linear client not configured');
		}

		console.log('[Linear Service] Linear client configured, attempting direct issue lookup');

		try {
			// STRATEGY 1: Direct Issue Lookup (MOST EFFICIENT - 1 API call)
			console.log('[Linear Service] Attempting direct issue lookup for:', identifier);
			
			try {
				const issue = await this.client.issue(identifier);
				console.log('[Linear Service] ✅ SUCCESS: Found issue via direct lookup:', {
					identifier: issue.identifier,
					id: issue.id,
					title: issue.title
				});
				
				// Build the full issue object
				return await this.buildIssueObject(issue);
				
			} catch (directLookupError) {
				console.log('[Linear Service] ❌ Direct lookup failed for:', identifier);
				console.log('[Linear Service] Direct lookup error:', directLookupError instanceof Error ? directLookupError.message : 'Unknown error');
				console.log('[Linear Service] Proceeding to fallback search strategies...');
				
				// Don't throw here - continue to fallback strategies
			}

			// STRATEGY 2: Enhanced Team-based Approach (FALLBACK)
			console.log('[Linear Service] Fallback Strategy 2: Enhanced team-based approach');
			const teamKey = this.extractTeamKeyFromIdentifier(identifier);
			
			if (teamKey) {
				console.log('[Linear Service] Extracted team key:', teamKey, 'from identifier:', identifier);
				
				// Get the team by key
				const team = await this.getTeamByKey(teamKey);
				
				if (team) {
					console.log('[Linear Service] Found team:', team.name, 'searching its issues with enhanced parameters');
					
					// Get issues from this specific team with enhanced ordering
					const teamIssues = await this.getTeamIssuesEnhanced(team.id);
					
					// Find the issue with matching identifier
					const matchingIssue = teamIssues.find((issue: any) => issue.identifier === identifier);
					
					if (matchingIssue) {
						console.log('[Linear Service] ✅ Found issue via enhanced team search:', {
							identifier: matchingIssue.identifier,
							id: matchingIssue.id,
							title: matchingIssue.title
						});
						
						// Build the full issue object
						return await this.buildIssueObject(matchingIssue);
					} else {
						console.warn('[Linear Service] Issue not found in team', team.name, 'issues');
					}
				} else {
					console.warn('[Linear Service] Team not found for key:', teamKey);
				}
			} else {
				console.warn('[Linear Service] Could not extract team key from identifier:', identifier);
			}

			// STRATEGY 3: Comprehensive Workspace Search (LAST RESORT)
			console.log('[Linear Service] Fallback Strategy 3: Comprehensive workspace search');
			
			let cursor: string | undefined;
			let searchCompleted = false;
			const batchSize = 100;
			const maxBatches = 50; // Up to 5000 issues
			let batchCount = 0;

			while (!searchCompleted && batchCount < maxBatches) {
				console.log('[Linear Service] Fetching batch', batchCount + 1, 'of issues from workspace');
				
				const issuesQuery: any = { first: batchSize };
				if (cursor) {
					issuesQuery.after = cursor;
				}
				
				const issues = await this.client.issues(issuesQuery);
				const batch = issues.nodes;
				
				console.log('[Linear Service] Retrieved', batch.length, 'issues in batch', batchCount + 1);
				
				// Check if our issue is in this batch
				const matchingIssue = batch.find(issue => issue.identifier === identifier);
				if (matchingIssue) {
					console.log('[Linear Service] ✅ Found issue via comprehensive workspace search:', {
						identifier: matchingIssue.identifier,
						id: matchingIssue.id,
						title: matchingIssue.title
					});
					
					return await this.buildIssueObject(matchingIssue);
				}
				
				// Check if we have more pages
				const pageInfo = issues.pageInfo;
				if (!pageInfo.hasNextPage) {
					searchCompleted = true;
					console.log('[Linear Service] Reached end of issues, no more pages');
				} else {
					cursor = pageInfo.endCursor;
					console.log('[Linear Service] More pages available, continuing search');
				}
				
				batchCount++;
			}

			if (batchCount >= maxBatches) {
				console.warn('[Linear Service] Reached maximum batch limit, search incomplete');
			}

			console.warn('[Linear Service] ❌ Issue not found after all search strategies:', identifier);
			return null;

		} catch (error) {
			console.error('[Linear Service] Error in getIssueByIdentifier:', error);
			if (error instanceof LinearError) {
				console.error('[Linear Service] LinearError details:', {
					message: error.message,
					type: error.type,
					query: error.query,
					variables: error.variables
				});
				throw new Error(`Failed to fetch issue ${identifier}: ${error.message}`);
			}
			console.error('[Linear Service] Unknown error type:', typeof error, error);
			throw error;
		}
	}

	private async buildIssueObject(issue: any): Promise<LinearIssue> {
		console.log('[Linear Service] Building issue object for:', issue.identifier);
		
		// Fetch all related objects
		const assignee = await issue.assignee;
		const creator = await issue.creator;
		const team = await issue.team;
		const state = await issue.state;
		const project = await issue.project;
		const cycle = await issue.cycle;
		const labels = await issue.labels;
		const comments = await issue.comments;
		const attachments = await issue.attachments;

		console.log('[Linear Service] Issue details fetched:', {
			assignee: assignee ? assignee.name : 'none',
			creator: creator ? creator.name : 'none',
			team: team.name,
			state: state.name,
			project: project ? project.name : 'none',
			cycle: cycle ? cycle.name : 'none',
			labelsCount: labels && labels.nodes ? labels.nodes.length : 0,
			commentsCount: comments && comments.nodes ? comments.nodes.length : 0,
			attachmentsCount: attachments && attachments.nodes ? attachments.nodes.length : 0
		});

		const result = {
			id: issue.id,
			identifier: issue.identifier,
			title: issue.title,
			description: issue.description || undefined,
			priority: issue.priority,
			createdAt: issue.createdAt.toISOString(),
			updatedAt: issue.updatedAt.toISOString(),
			completedAt: issue.completedAt?.toISOString(),
			dueDate: issue.dueDate?.toISOString(),
			estimate: issue.estimate || undefined,
			url: issue.url || `https://linear.app/issue/${issue.identifier}`,
			branchName: issue.branchName || undefined,
			assignee: assignee ? {
				id: assignee.id,
				name: assignee.name,
				displayName: assignee.displayName
			} : undefined,
			creator: creator ? {
				id: creator.id,
				name: creator.name,
				displayName: creator.displayName
			} : undefined,
			team: {
				id: team.id,
				name: team.name,
				key: team.key
			},
			state: {
				id: state.id,
				name: state.name,
				type: state.type
			},
			project: project ? {
				id: project.id,
				name: project.name,
				description: project.description || undefined,
				state: project.state || undefined,
				progress: project.progress || undefined
			} : undefined,
			cycle: cycle ? {
				id: cycle.id,
				name: cycle.name,
				number: cycle.number || undefined,
				completedAt: cycle.completedAt?.toISOString()
			} : undefined,
			labels: labels && labels.nodes ? labels.nodes.map((label: any) => ({
				id: label.id,
				name: label.name,
				color: label.color
			})) : undefined,
			comments: comments && comments.nodes ? comments.nodes.map((comment: any) => ({
				id: comment.id,
				body: comment.body,
				createdAt: comment.createdAt.toISOString(),
				user: {
					id: comment.user.id,
					name: comment.user.name
				}
			})) : undefined,
			attachments: attachments && attachments.nodes ? attachments.nodes.map((attachment: any) => ({
				id: attachment.id,
				title: attachment.title,
				url: attachment.url,
				subtitle: attachment.subtitle || undefined
			})) : undefined
		};

		console.log('[Linear Service] Successfully built issue object:', {
			identifier: result.identifier,
			title: result.title,
			team: result.team.name,
			state: result.state.name,
			hasProject: !!result.project,
			hasCycle: !!result.cycle,
			labelsCount: result.labels?.length || 0,
			commentsCount: result.comments?.length || 0
		});

		return result;
	}
}