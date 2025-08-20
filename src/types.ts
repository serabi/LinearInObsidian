export interface LinearPluginSettings {
	linearApiKey: string;
	debugMode: boolean;
}

export const DEFAULT_SETTINGS: LinearPluginSettings = {
	linearApiKey: '',
	debugMode: false
};

export interface LinearIssue {
	id: string;
	identifier: string;
	title: string;
	description?: string;
	priority: number;
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
	dueDate?: string;
	estimate?: number;
	url?: string;
	branchName?: string;
	assignee?: {
		id: string;
		name: string;
		displayName: string;
	};
	creator?: {
		id: string;
		name: string;
		displayName: string;
	};
	team: {
		id: string;
		name: string;
		key: string;
	};
	state: {
		id: string;
		name: string;
		type: string;
	};
	project?: {
		id: string;
		name: string;
		description?: string;
		state?: string;
		progress?: number;
	};
	cycle?: {
		id: string;
		name: string;
		number?: number;
		completedAt?: string;
	};
	labels?: Array<{
		id: string;
		name: string;
		color: string;
	}>;
	comments?: Array<{
		id: string;
		body: string;
		createdAt: string;
		user: {
			id: string;
			name: string;
		};
	}>;
	attachments?: Array<{
		id: string;
		title: string;
		url: string;
		subtitle?: string;
	}>;
	relations?: Array<{
		id: string;
		type: string;
		relatedIssue: {
			id: string;
			identifier: string;
			title: string;
		};
	}>;
	slaStatus?: {
		status: string;
		timeRemaining?: number;
	};
}

export interface LinearTeam {
	id: string;
	name: string;
	key: string;
	description?: string;
}

export interface LinearProject {
	id: string;
	name: string;
	description?: string;
	state: string;
	progress: number;
	targetDate?: string;
	lead?: {
		id: string;
		name: string;
	};
}

export interface LinearUser {
	id: string;
	name: string;
	displayName: string;
	email: string;
}