import type { LoggerService } from '@nestjs/common';
import { LoggerStrategy } from '../config/strategies/logger/logger-strategy.interface';

export class Logger implements LoggerService {
	private static _instance = Logger;
	private static _loggerStrategy: LoggerStrategy;

	private get instance(): typeof Logger {
		return Logger._instance;
	}

	static get loggerStrategy(): LoggerStrategy {
		return Logger._loggerStrategy;
	}
	static setLoggerStrategy(strategy: LoggerStrategy): void {
		Logger._loggerStrategy = strategy;
	}

	static info(message: string, context?: string): void {
		Logger.loggerStrategy.info(message, context);
	}
	static verbose(message: string, context?: string): void {
		Logger.loggerStrategy.verbose(message, context);
	}
	static debug(message: string, context?: string): void {
		Logger.loggerStrategy.debug(message, context);
	}
	static warn(message: string, context?: string): void {
		Logger.loggerStrategy.warn(message, context);
	}
	static error(message: any, context?: string, trace?: any): void {
		Logger.loggerStrategy.error(message, context, trace);
	}

	// internal to nestjs
	log(message: any, context?: any): void {
		this.instance.info(message, context);
	}
	debug?(message: any, context?: any): void {
		this.instance.debug(message, context);
	}
	verbose?(message: any, context?: any): void {
		this.instance.verbose(message, context);
	}
	warn(message: any, context?: any): void {
		this.instance.warn(message, context);
	}
	error(message: any, context?: any, trace?: any): void {
		if (message instanceof Error) {
			const err = message;
			this.instance.error(err.message, context, err.stack);
		} else {
			this.instance.error(message, context, trace);
		}
	}
}
