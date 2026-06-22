import { FilterGroupOperator } from '@matjar/common/lib/generated-types';
import { AppEntity } from '../helpers/app-entity';
import { LocaleString } from './translatable';

export type SortDirection = 'ASC' | 'DESC';

/**
 * @description
 * Adds null to all optional fields to make them compatible with apollo GraphQL
 */
export type NullOptionals<T> = {
	[Key in keyof T]: undefined extends T[Key] ? NullOptionals<T[Key]> | null : NullOptionals<T[Key]>;
};

/**
 * @description
 * This interface defines all options available to any input type that supports pagination
 */
export interface ListQueryOptions<Entity extends AppEntity> {
	take?: number | null;
	skip?: number | null;
	sort?: NullOptionals<SortParameter<Entity>> | null;
	filter?: NullOptionals<FilterParameter<Entity>> | null;
	filterOperator?: FilterGroupOperator | null;
}

export type PrimitiveFields<Entity extends AppEntity> = {
	[Key in keyof Entity]: NonNullable<Entity[Key]> extends LocaleString | number | string | boolean | Date
		? Key
		: never;
}[keyof Entity];

export type SortParameter<Entity extends AppEntity> = {
	[Key in PrimitiveFields<Entity>]?: SortDirection;
};

export type FilterParameter<Entity extends AppEntity> = {
	[Key in PrimitiveFields<Entity>]?: Entity[Key] extends string | LocaleString
		? TextFilterInput
		: Entity[Key] extends number
			? NumericFilterInput
			: Entity[Key] extends boolean
				? BooleanFilterInput
				: Entity[Key] extends Date
					? DateTimeFilterInput
					: TextFilterInput;
} & {
	_and?: Array<FilterParameter<Entity>>;
	_or?: Array<FilterParameter<Entity>>;
};

export type TextFilterInput = {
	equals?: string;
	notEquals?: string;
	contains?: string;
	doesNotContain?: string;
	includedIn?: string[];
	excludedFrom?: string[];
	matchesRegex?: string;
	isNull?: boolean;
};

export type NumericFilterInput = {
	equals?: number;
	lessThan?: number;
	lessThanOrEqual?: number;
	greaterThan?: number;
	greaterThanOrEqual?: number;
	withinRange?: NumericRangeInput;
	isNull?: boolean;
};

export interface NumericRangeInput {
	min: number;
	max: number;
}

export type BooleanFilterInput = {
	equals: boolean;
	isNull: boolean;
};

export type DateTimeRangeInput = {
	from: Date;
	to: Date;
};

export type DateTimeFilterInput = {
	equals?: Date;
	before?: Date;
	after?: Date;
	withinRange?: DateTimeRangeInput;
	isNull?: boolean;
};

export type ListFilterInput = {
	inList?: string | number | boolean | Date;
};
