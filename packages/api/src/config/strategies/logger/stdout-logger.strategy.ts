import pc from 'picocolors';
import { LoggerStrategy, LogLevel } from './logger-strategy.interface';

const DEFAULT_CONTEXT = 'RiwaqServer';

interface StdoutLoggerStrategyOptions {
	defaultContext?: string;
	logLevel?: LogLevel;
}

export class StdoutLoggerStrategy implements LoggerStrategy {
	private defaultContext;
	private logLevel = LogLevel.Info;

	constructor(options?: StdoutLoggerStrategyOptions) {
		this.defaultContext = options?.defaultContext || DEFAULT_CONTEXT;
		this.logLevel = options?.logLevel !== undefined ? options.logLevel : LogLevel.Info;
	}

	info(message: string, context?: string): void | Promise<void> {
		if (this.logLevel >= LogLevel.Info) {
			this.log(
				`${pc.bgCyan('Info')}    `,
				this.stringify(message),
				pc.cyanBright(this.resolveContext(context)),
			);
		}
	}

	debug(message: string, context?: string): void | Promise<void> {
		if (this.logLevel >= LogLevel.Debug) {
			this.log(
				`${pc.bgGreen('Debug')}   `,
				this.stringify(message),
				pc.greenBright(this.resolveContext(context)),
			);
		}
	}

	verbose(message: string, context?: string): void | Promise<void> {
		if (this.logLevel >= LogLevel.Verbose) {
			this.log(
				`${pc.bgMagenta('Verbose')} `,
				this.stringify(message),
				pc.magentaBright(this.resolveContext(context)),
			);
		}
	}

	warn(message: string, context?: string): void | Promise<void> {
		if (this.logLevel >= LogLevel.Warn) {
			this.log(
				`${pc.bgYellowBright('Warn')}    `,
				this.stringify(message),
				pc.yellowBright(this.resolveContext(context)),
			);
		}
	}

	error(message: string, context?: string, trace?: any): void | Promise<void> {
		if (this.logLevel >= LogLevel.Error) {
			this.log(
				`${pc.bgRedBright('Error')}   `,
				this.stringify(message),
				pc.redBright(this.resolveContext(context)),
				this.stringify(trace),
			);
		}
	}

	private log(level: string, message: string, context: string, trace?: string): void {
		const timestamp = this.getTimestamp();
		const resolvedContext = context ?? this.defaultContext;
		const line = [
			level,
			`${timestamp} -`,
			`[${resolvedContext}]`,
			trace ? `${message}\n${trace}` : message,
			'\n',
		];
		process.stdout.write(line.join('  '));
	}

	private resolveContext(context?: string): string {
		return context ?? this.defaultContext;
	}

	private stringify(input: any): string {
		return typeof input === 'string' ? input : JSON.stringify(input);
	}

	private getTimestamp(): string {
		return pc.gray(
			new Date().toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			}),
		);
	}
}
