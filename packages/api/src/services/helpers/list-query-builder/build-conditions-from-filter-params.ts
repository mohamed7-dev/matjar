import { FilterGroupOperator } from '@matjar/common/lib/generated-types';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DateUtils } from 'typeorm/util/DateUtils.js';
import { InternalServerError, UserInputError } from '../../../common/errors/errors';
import { AppEntity } from '../../../common/helpers/app-entity';
import { ClassType } from '../../../common/types/class-type';
import type {
	BooleanFilterInput,
	DateTimeFilterInput,
	DateTimeRangeInput,
	FilterParameter,
	ListFilterInput,
	NullOptionals,
	NumericFilterInput,
	NumericRangeInput,
	TextFilterInput,
} from '../../../common/types/list-query-options';
import { getEntityMetadata } from '../../../orm/utils/get-entity-metadata';

export interface WhereGroup {
	operator: FilterGroupOperator;
	conditions: Array<WhereCondition | WhereGroup>;
}

export interface WhereCondition {
	clause: string;
	parameters: Record<string, string | number | string[]>;
}

type AllOperators = TextFilterInput & NumericFilterInput & DateTimeFilterInput & ListFilterInput;

type Operator = { [K in keyof AllOperators]-?: K }[keyof AllOperators];

export function buildConditionsFromFilterParams<Entity extends AppEntity>(
	dataSource: DataSource,
	entityType: ClassType<Entity>,
	filterParams?: NullOptionals<FilterParameter<Entity>> | null,
	customPropsMap?: Record<string, string>,
	entityAlias?: string,
): Array<WhereCondition | WhereGroup> {
	if (!filterParams) return [];

	const { columns, alias: defaultAlias, translationColumns } = getEntityMetadata(dataSource, entityType);
	const dbType = dataSource.options.type;

	const alias = entityAlias ?? defaultAlias;
	let argIndex = 1;

	function buildConditionForField(
		filterProp: string,
		operation: FilterParameter<Entity>,
	): WhereCondition[] {
		const output: Array<WhereCondition> = [];

		// TODO: add support for calculated columns
		for (const [operator, operand] of Object.entries(operation)) {
			let fieldName: string;
			const matchingColumn = columns.find((c) => c.propertyName === filterProp);
			const matchingTranslationColumn = translationColumns.find((c) => c.propertyName === filterProp);
			if (matchingColumn) {
				fieldName = `${alias}.${matchingColumn.propertyPath}`;
			} else if (matchingTranslationColumn) {
				const translationsAlias = [
					alias,
					'translations',
				].join('__');
				fieldName = `${translationsAlias}.${matchingTranslationColumn.propertyPath}`;
			} else if (customPropsMap?.[filterProp]) {
				fieldName = customPropsMap[filterProp];
			} else {
				throw new UserInputError('errors');
			}
			const condition = buildWhereCondition(fieldName, operator as Operator, operand, argIndex, dbType);
			output.push(condition);
			argIndex++;
		}

		return output;
	}

	function processFilterOperation(
		filterParams: FilterParameter<Entity>,
	): Array<WhereCondition | WhereGroup> {
		const result: Array<WhereCondition | WhereGroup> = [];
		for (const [filterProp, operation] of Object.entries(filterParams)) {
			if (filterProp === '_and' || filterProp === '_or') {
				result.push({
					operator: filterProp === '_and' ? FilterGroupOperator.AND : FilterGroupOperator.OR,
					conditions: operation.flatMap((op) => processFilterOperation(op)),
				});
			} else if (operation && !Array.isArray(operation)) {
				result.push(...buildConditionForField(filterProp, operation));
			}
		}

		return result;
	}

	return processFilterOperation(filterParams as FilterParameter<Entity>);
}

function buildWhereCondition(
	fieldName: string,
	operator: Operator,
	operand: any,
	argIndex: number,
	dbType: DataSourceOptions['type'],
): WhereCondition {
	switch (operator) {
		case 'equals':
			return {
				clause: `${fieldName} = :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: convertDate(operand),
				},
			};
		case 'notEquals':
			return {
				clause: `${fieldName} != :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: convertDate(operand),
				},
			};
		case 'contains':
		case 'inList': {
			const LIKE = dbType === 'postgres' ? 'ILIKE' : 'LIKE';

			return {
				clause: `${fieldName} ${LIKE} :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: `%${typeof operand === 'string' ? operand.trim() : operand}%`,
				},
			};
		}
		case 'doesNotContain': {
			const LIKE = dbType === 'postgres' ? 'ILIKE' : 'LIKE';

			return {
				clause: `${fieldName} NOT ${LIKE} :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: `%${operand.trim()}%`,
				},
			};
		}
		case 'includedIn': {
			if (Array.isArray(operand) && operand.length > 0) {
				return {
					clause: `${fieldName} IN (:...arg${argIndex})`,
					parameters: {
						[`arg${argIndex}`]: operand,
					},
				};
			} else {
				// includedIn: <empty set> so it doesn't participate in the filtering
				return {
					clause: '1 = 0',
					parameters: {},
				};
			}
		}
		case 'excludedFrom': {
			if (Array.isArray(operand) && operand.length > 0) {
				return {
					clause: `${fieldName} NOT IN (:...arg${argIndex})`,
					parameters: {
						[`arg${argIndex}`]: operand,
					},
				};
			} else {
				// excludedFrom: <empty set> so it doesn't participate in the filtering
				return {
					clause: '1 = 0',
					parameters: {},
				};
			}
		}
		case 'matchesRegex': {
			return {
				clause: getRegexpClause(fieldName, argIndex, dbType),
				parameters: {
					[`arg${argIndex}`]: operand,
				},
			};
		}
		case 'lessThan':
		case 'before': {
			return {
				clause: `${fieldName} < :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: convertDate(operand),
				},
			};
		}
		case 'greaterThan':
		case 'after': {
			return {
				clause: `${fieldName} > :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: convertDate(operand),
				},
			};
		}
		case 'lessThanOrEqual': {
			return {
				clause: `${fieldName} <= :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: operand,
				},
			};
		}
		case 'greaterThanOrEqual': {
			return {
				clause: `${fieldName} >= :arg${argIndex}`,
				parameters: {
					[`arg${argIndex}`]: operand,
				},
			};
		}
		case 'withinRange': {
			return {
				clause: `${fieldName} BETWEEN :arg${argIndex}_a AND :arg${argIndex}_b`,
				parameters: {
					[`arg${argIndex}_a`]:
						(operand as DateTimeRangeInput).from instanceof Date
							? convertDate(operand.from)
							: (operand as NumericRangeInput).min,
					[`arg${argIndex}_b`]:
						(operand as DateTimeRangeInput).to instanceof Date
							? convertDate(operand.to)
							: (operand as NumericRangeInput).max,
				},
			};
		}
		case 'isNull': {
			return {
				clause: `${fieldName} ${operand === true ? 'IS NULL' : 'IS NOT NULL'}`,
				parameters: {},
			};
		}
		default: {
			return {
				clause: '1',
				parameters: {},
			};
		}
	}
}

function convertDate(input: Date | string | number): string | number {
	if (input instanceof Date) {
		return DateUtils.mixedDateToUtcDatetimeString(input);
	}
	return input;
}

function getRegexpClause(fieldName: string, argIndex: number, dbType: DataSourceOptions['type']): string {
	switch (dbType) {
		case 'mariadb':
		case 'mysql':
		case 'sqljs':
		case 'better-sqlite3':
		case 'aurora-mysql':
			return `${fieldName} REGEXP :arg${argIndex}`;
		case 'postgres':
		case 'aurora-postgres':
		case 'cockroachdb':
			return `${fieldName} ~* :arg${argIndex}`;
		// The node-sqlite3 driver does not support user-defined functions
		// and therefore we are unable to define a custom regexp
		// function. See https://github.com/mapbox/node-sqlite3/issues/140
		case 'sqlite':
		default:
			throw new InternalServerError(
				`The 'regex' filter is not available when using the '${dbType}' driver`,
			);
	}
}
