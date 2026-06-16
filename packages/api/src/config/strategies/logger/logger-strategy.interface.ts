export interface LoggerStrategy {
	info(message: string, context?: string): void | Promise<void>;
	debug(message: string, context?: string): void | Promise<void>;
	verbose(message: string, context?: string): void | Promise<void>;
	warn(message: string, context?: string): void | Promise<void>;
	error(message: string, context?: string, trace?: any): void | Promise<void>;
}

export enum LogLevel {
	Error = 0,
	Warn = 1,
	Info = 2,
	Verbose = 3,
	Debug = 4,
}
