import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import {
	buildSchema,
	GraphQLEnumType,
	GraphQLField,
	GraphQLInputField,
	GraphQLInputFieldConfig,
	GraphQLInputFieldConfigMap,
	GraphQLInputObjectType,
	GraphQLInputType,
	GraphQLInt,
	GraphQLList,
	GraphQLNamedType,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLSchema,
	isEnumType,
	isInputObjectType,
	isListType,
	isNonNullType,
	isObjectType,
} from 'graphql';
import { notNullOrUndefined } from '../../common/utils/not-null-or-undefined';

export function generateListOptions(sdlStringOrSchema: string | GraphQLSchema): GraphQLSchema {
	const schema = typeof sdlStringOrSchema === 'string' ? buildSchema(sdlStringOrSchema) : sdlStringOrSchema;

	const queryType = schema.getQueryType();
	if (!queryType) return schema;

	// get all object types
	const objectTypes = Object.values(schema.getTypeMap()).filter(isObjectType);

	// Query
	//--- marketplaceRegions(): MarketplaceRegionList

	// reduce the list to include only those object types that extend PaginatedList interface
	const allFields = objectTypes.reduce(
		(fields, type) => {
			const typeFields = Object.values(type.getFields()).filter((f) => isListQueryType(f.type));
			return [
				...fields,
				...typeFields,
			];
		},
		[] as Array<GraphQLField<any, any>>,
	);

	// All fields
	//--- marketplaceRegions(): MarketplaceRegionList

	const generatedTypes: GraphQLNamedType[] = [];

	for (const query of allFields) {
		// MarketplaceRegionList -> MarketplaceRegion
		const targetTypeName = unwrapNonNullType(query.type).toString().replace(/List$/, '');
		// get MarketplaceRegion object type
		const targetType = schema.getType(targetTypeName);
		if (targetType && isObjectType(targetType)) {
			// only fields with scalar types are sortable
			// and the shape of the input looks something like this e.g. {name: {type: "ASC"}}
			const sortParam = createSortParam(targetType, schema);
			// only fields with scalar types are filterable
			// and each scalar type defines specific set of filter options
			// and the shape of the input looks something like this e.g. {name: {contains: "laptop"}}
			const filterParam = createFilterParam(targetType, schema);
			// put everything together to form input type with this shape e.g. {sort: SortParameter, filter: FilterParameter, ..etc}
			const listOptionsInput = createListOptionsInput(schema, targetType, sortParam, filterParam);
			if (query.args.find((arg) => arg.type.toString() === `${targetTypeName}ListOptions`)) {
				query.args = [
					...query.args,
					{
						name: 'options',
						type: listOptionsInput,
						description: null,
						defaultValue: null,
						extensions: {},
						astNode: null,
						deprecationReason: null,
					},
				];
			}
			generatedTypes.push(filterParam);
			generatedTypes.push(sortParam);
			generatedTypes.push(listOptionsInput);
		}
	}

	return stitchSchemas({
		subschemas: [
			schema,
		],
		types: generatedTypes,
		typeMergingOptions: {
			validationSettings: {
				validationLevel: ValidationLevel.Off,
			},
		},
	});
}

function createSortParam(targetType: GraphQLObjectType, schema: GraphQLSchema): GraphQLInputObjectType {
	const targetTypeFields: Array<GraphQLField<any, any> | GraphQLInputField> = Object.values(
		targetType.getFields(),
	);
	const inputName = `${targetType.name}SortParameter`;
	const { SortDirection } = getCommonTypes(schema);

	// TODO: focus on this area, i am not able to visualize what's happening here
	const existingInput = schema.getType(inputName);
	if (isInputObjectType(existingInput)) {
		targetTypeFields.push(...Object.values(existingInput.getFields()));
	}

	const scalarTypes = [
		'ID',
		'String',
		'Int',
		'Float',
		'DateTime',
		'Money',
	];

	return new GraphQLInputObjectType({
		name: inputName,
		fields: targetTypeFields
			.map((field) => {
				if (unwrapNonNullType(field.type) === SortDirection) {
					return field;
				} else {
					const innerType = unwrapNonNullType(field.type);
					if (isListType(innerType)) return undefined;
					return scalarTypes.includes(innerType.name) ? field : undefined;
				}
			})
			.filter(notNullOrUndefined)
			.reduce((fields, field) => {
				const fieldConfig: GraphQLInputFieldConfig = {
					type: SortDirection,
				};
				return {
					...fields,
					[field.name]: fieldConfig,
				};
			}, {} as GraphQLInputFieldConfigMap),
	});
}

function createFilterParam(targetType: GraphQLObjectType, schema: GraphQLSchema): GraphQLInputObjectType {
	const targetTypeFields: Array<GraphQLField<any, any> | GraphQLInputField> = Object.values(
		targetType.getFields(),
	);
	const inputName = `${targetType.name}FilterParameter`;
	const existingInput = schema.getType(inputName);

	if (isInputObjectType(existingInput)) {
		targetTypeFields.push(...Object.values(existingInput.getFields()));
	}

	const {
		TextFilterInput,
		BooleanFilterInput,
		NumericFilterInput,
		DateTimeFilterInput,
		IdentifierFilterInput,
	} = getCommonTypes(schema);

	function getFilterType(field: GraphQLField<any, any> | GraphQLInputField): GraphQLInputType | undefined {
		const innerType = unwrapNonNullType(field.type);
		if (isListType(innerType)) {
			return;
		}
		if (isEnumType(innerType)) {
			return TextFilterInput;
		}
		switch (innerType.name) {
			case 'String':
				return TextFilterInput;
			case 'Boolean':
				return BooleanFilterInput;
			case 'Int':
			case 'Float':
			case 'Money':
				return NumericFilterInput;
			case 'DateTime':
				return DateTimeFilterInput;
			case 'ID':
				return IdentifierFilterInput;
			default:
				return;
		}
	}

	return new GraphQLInputObjectType({
		name: inputName,
		fields: targetTypeFields.reduce((fields, field) => {
			const filterType = isInputObjectType(field.type) ? field.type : getFilterType(field);
			if (!filterType) return fields;
			const fieldConfig: GraphQLInputFieldConfig = {
				type: filterType,
			};
			return {
				...fields,
				[field.name]: fieldConfig,
			};
		}, {} as GraphQLInputFieldConfigMap),
	});
}

function createListOptionsInput(
	schema: GraphQLSchema,
	targetType: GraphQLObjectType,
	sortParam: GraphQLInputObjectType,
	filterParam: GraphQLInputObjectType,
): GraphQLInputObjectType {
	const existingListOptions = schema.getType(
		`${targetType.name}ListOptions`,
	) as GraphQLInputObjectType | null;
	const { FilterGroupOperator } = getCommonTypes(schema);

	return new GraphQLInputObjectType({
		name: `${targetType.name}ListOptions`,
		fields: {
			skip: {
				type: GraphQLInt,
				description: 'Skips the first n results, for use in pagination',
			},
			take: {
				type: GraphQLInt,
				description: 'Takes n results, for use in pagination',
			},
			sort: {
				type: sortParam,
				description: 'Specifies which properties to sort the results by',
			},
			filter: {
				type: filterParam,
				description: 'Allows the results to be filtered',
			},
			...(FilterGroupOperator
				? {
						filterOperator: {
							type: FilterGroupOperator as GraphQLEnumType,
							description:
								'Specifies whether multiple top-level "filter" fields should be combined ' +
								'with a logical AND or OR operation. Defaults to AND.',
						},
					}
				: {}),
			...(existingListOptions ? existingListOptions.getFields() : {}),
		},
	});
}

function getCommonTypes(schema: GraphQLSchema): Record<string, GraphQLEnumType | GraphQLInputType> {
	const SortDirection = schema.getType('SortDirection') as GraphQLEnumType | null;
	const NumericRangeInput = schema.getType('NumericRangeInput') as GraphQLInputType | null;
	const NumericFilterInput = schema.getType('NumericFilterInput') as GraphQLInputType | null;
	const TextFilterInput = schema.getType('TextFilterInput') as GraphQLInputType | null;
	const BooleanFilterInput = schema.getType('BooleanFilterInput') as GraphQLInputType | null;
	const DateTimeRangeInput = schema.getType('DateTimeRangeInput') as GraphQLInputType | null;
	const DateTimeFilterInput = schema.getType('DateTimeFilterInput') as GraphQLInputType | null;
	const IdentifierFilterInput = schema.getType('IdentifierFilterInput') as GraphQLInputType | null;
	const FilterGroupOperator = schema.getType('FilterGroupOperator') as GraphQLEnumType | null;

	if (
		!SortDirection ||
		!FilterGroupOperator ||
		!TextFilterInput ||
		!BooleanFilterInput ||
		!NumericRangeInput ||
		!NumericFilterInput ||
		!DateTimeRangeInput ||
		!DateTimeFilterInput ||
		!IdentifierFilterInput
	) {
		throw new Error('Error while querying a common type');
	}

	return {
		SortDirection,
		FilterGroupOperator,
		TextFilterInput,
		BooleanFilterInput,
		NumericFilterInput,
		DateTimeFilterInput,
		IdentifierFilterInput,
	};
}

function isListQueryType(type: GraphQLOutputType): type is GraphQLObjectType {
	const innerType = unwrapNonNullType(type);
	return isObjectType(innerType) && !!innerType.getInterfaces().find((i) => i.name === 'PaginatedList');
}

function unwrapNonNullType(
	type: GraphQLOutputType | GraphQLInputType,
): GraphQLNamedType | GraphQLList<GraphQLOutputType | GraphQLInputType> {
	if (isNonNullType(type)) {
		return type.ofType;
	}
	return type;
}
