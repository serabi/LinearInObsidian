export class DebugLogger {
	private isDebugMode: boolean = false;

	setDebugMode(enabled: boolean): void {
		this.isDebugMode = enabled;
	}

	log(tag: string, message: string, ...args: any[]): void {
		if (this.isDebugMode) {
			console.log(`[${tag}]`, message, ...args);
		}
	}

	warn(tag: string, message: string, ...args: any[]): void {
		if (this.isDebugMode) {
			console.warn(`[${tag}]`, message, ...args);
		}
	}

	error(tag: string, message: string, ...args: any[]): void {
		if (this.isDebugMode) {
			console.error(`[${tag}]`, message, ...args);
		}
	}

	group(tag: string, label: string): void {
		if (this.isDebugMode) {
			console.group(`[${tag}] ${label}`);
		}
	}

	groupEnd(): void {
		if (this.isDebugMode) {
			console.groupEnd();
		}
	}
}

// Global debug logger instance
export const debugLogger = new DebugLogger();