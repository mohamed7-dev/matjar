import { LogLevel } from '../../config/strategies/logger/logger-strategy.interface';
import { type EntityNames } from '../../entities/entities-map';
import { I18nError } from '../../i18n/i18n-error';

export class InternalServerError extends I18nError {
	constructor(message: string, variables?: Record<string, string | number>) {
		super(message, variables, 'INTERNAL_SERVER_ERROR', LogLevel.Error);
	}
}

/**
 * @description
 * Represents an error caused by invalid user input.
 * Used when the user provides data that fails validation or business rules.
 */
export class UserInputError extends I18nError {
	constructor(
		message: string,
		variables: {
			[key: string]: string | number;
		} = {},
	) {
		super(message, variables, 'USER_INPUT_ERROR', LogLevel.Warn);
	}
}

/**
 * @description
 * Represents an error caused by a user not having permission to access a resource.
 */
export class ForbiddenError extends I18nError {
	constructor(logLevel?: LogLevel) {
		super('errors.forbidden', {}, 'FORBIDDEN_ERROR', logLevel ?? LogLevel.Warn);
	}
}

export class MarketplaceRegionNotFoundError extends I18nError {
	constructor(token: string) {
		super(
			'errors.marketplace_region_not_found',
			{
				token,
			},
			'MARKETPLACE_REGION_NOT_FOUND_ERROR',
			LogLevel.Info,
		);
	}
}

/**
 * @description
 * Represents an error caused by an entity not being found in the database.
 */
export class EntityNotFoundError extends I18nError {
	constructor(
		variables: {
			entityName: EntityNames;
			entityId: string;
		},
		logLevel?: LogLevel,
	) {
		super(
			'errors.entity_with_id_not_found',
			variables,
			'ENTITY_NOT_FOUND_ERROR',
			logLevel ?? LogLevel.Warn,
		);
	}
}

export class DuplicateRoleAssignmentError extends I18nError {
	constructor(
		variables: {
			roleCode: string;
			userId: string;
		},
		logLevel?: LogLevel,
	) {
		super(
			'errors.duplicate_role_assignment',
			variables,
			'DUPLICATE_ROLE_ASSIGNMENT',
			logLevel ?? LogLevel.Warn,
		);
	}
}

export class CompanyMarketplaceMembershipError extends I18nError {
	constructor(
		variables: {
			companyCode: string;
		},
		logLevel?: LogLevel,
	) {
		super(
			'errors.company_not_available_in_marketplace',
			variables,
			'COMPANY_MARKETPLACE_MEMBERSHIP_ERROR',
			logLevel ?? LogLevel.Warn,
		);
	}
}
