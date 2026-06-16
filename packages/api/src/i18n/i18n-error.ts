import { GraphQLError } from 'graphql';
import { LogLevel } from '../config/strategies/logger/logger-strategy.interface';

export class I18nError extends GraphQLError {
	constructor(
		public message: string,
		public variables: Record<string, string | number> = {},
		public code: string,
		public logLevel: LogLevel,
	) {
		super(message);
	}
}
