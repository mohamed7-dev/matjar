import { LogLevel } from '../../config/strategies/logger/logger-strategy.interface';
import { I18nError } from '../../i18n/i18n-error';

export class InternalServerError extends I18nError {
	constructor(message: string, variables?: Record<string, string | number>) {
		super(message, variables, 'INTERNAL_SERVER_ERROR', LogLevel.Error);
	}
}
