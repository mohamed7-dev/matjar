import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { LogLevel } from '../../config/strategies/logger/logger-strategy.interface';
import { I18nError } from '../../i18n/i18n-error';
import { Logger } from '../../logger';
import { parseContext } from '../utils/parse-context';

@Catch()
export class I18nExceptionLoggerFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost): any {
		const { res, isGraphQL } = parseContext(host);

		let message = '';
		let statusCode = 500;
		if (exception instanceof I18nError) {
			const { code, message: msg, logLevel } = exception;
			message = `${code || 'Error'}: ${msg}`;
			statusCode = this.mapCodeToStatusCode(code);
			switch (logLevel) {
				case LogLevel.Error:
					Logger.error(
						JSON.stringify(
							{
								message,
								variables: exception.variables,
							},
							null,
							2,
						),
						undefined,
						exception.stack,
					);
					break;
				case LogLevel.Warn:
					Logger.warn(message);
					break;
				case LogLevel.Info:
					Logger.info(message);
					break;
				case LogLevel.Debug:
					Logger.debug(message);
					break;
				case LogLevel.Verbose:
					Logger.verbose(message);
					break;
			}
			if (exception.stack) {
				Logger.debug(exception.stack);
			}

			if (isGraphQL) {
				return exception;
			}
		} else if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			message = exception.message;
			if (statusCode === 404) {
				Logger.verbose(exception.message);
			} else {
				Logger.error(message, undefined, exception.stack);
			}
		} else {
			Logger.error(exception.message, undefined, exception.stack);
		}

		if (!isGraphQL) {
			// if REST context, send response
			res.status(statusCode).json({
				statusCode,
				message,
				timestamp: new Date().toISOString(),
			});
		}
	}

	private mapCodeToStatusCode(errorCode: string | undefined): number {
		switch (errorCode) {
			case 'FORBIDDEN':
				return 403;
			case 'UNAUTHORIZED':
				return 401;
			case 'USER_INPUT_ERROR':
			case 'ILLEGAL_OPERATION':
				return 400;
			default:
				return 500;
		}
	}
}
