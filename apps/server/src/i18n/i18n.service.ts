import { Injectable } from '@nestjs/common';
import { Handler, Request } from 'express';
import { GraphQLError } from 'graphql';
import i18next from 'i18next';
import i18NextMW from 'i18next-http-middleware';
import { GraphqlApiError } from '../common/errors/graphql-api-error';
import { I18nError } from './i18n-error';

const ERROR_CONTEXT_NAME = 'ErrorTranslationFailure';

@Injectable()
export class I18nService {
	public setupMiddleware(): Handler {
		return i18NextMW.handle(i18next);
	}

	/**
	 * @description
	 * Translates the message of any graphql error class that extends the `I18nError` class.
	 */
	public translateGraphqlError(error: GraphQLError, req: Request): GraphQLError {
		const originalError = error.originalError as I18nError;
		if (originalError instanceof I18nError) {
			let translatedMessage = originalError.message;
			try {
				const key = originalError.message;
				translatedMessage = req.t(key, originalError.variables);
			} catch (error: any) {
				translatedMessage += `([${ERROR_CONTEXT_NAME}]: ${typeof error.message === 'string' ? error.message : JSON.stringify(error.message)})`;
			}
			error.message = translatedMessage;
			delete (originalError as any).variables;
		}
		return error;
	}

	/**
	 * @description
	 * Translates the message of any api error returned by the resolver methods
	 */
	public translateGraphqlApiError(apiError: GraphqlApiError, req: Request): GraphqlApiError {
		let translatedMessage = apiError.message;
		try {
			const key = `apiErrors.${apiError.message}`;
			translatedMessage = req.t(key);
		} catch (error: any) {
			translatedMessage += `([${ERROR_CONTEXT_NAME}]: ${typeof error.message === 'string' ? error.message : JSON.stringify(error.message)})`;
		}
		apiError.message = translatedMessage;
		return apiError;
	}
}
