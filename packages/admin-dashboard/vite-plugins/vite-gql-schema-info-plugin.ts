import {
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	type GraphQLSchema,
	type GraphQLType,
	isEnumType,
	isInputObjectType,
	isObjectType,
	isScalarType,
} from 'graphql';
import type { Plugin } from 'vite';
import { type ConfigLoaderApi, getConfigLoaderApi } from './vite-app-config-loader-plugin.js';

const virtualModuleId = 'virtual:gql-schema-info';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

export type FieldInfoTuple = readonly [
	type: string,
	nullable: boolean,
	list: boolean,
	isPaginatedList: boolean,
];

export interface SchemaInfo {
	types: {
		[typename: string]: {
			[fieldname: string]: FieldInfoTuple;
		};
	};
	inputs: {
		[typename: string]: {
			[fieldname: string]: FieldInfoTuple;
		};
	};
	scalars: string[];
	enums: {
		[typename: string]: string[];
	};
}

export function viteGqlSchemaInfoPlugin(): Plugin {
	let configLoaderApi: ConfigLoaderApi;
	let schemaInfo: SchemaInfo;

	return {
		name: 'matjar:schema-info-plugin',
		configResolved({ plugins }) {
			configLoaderApi = getConfigLoaderApi(plugins);
		},
		async buildStart() {
			const appConfig = await configLoaderApi.getAppConfig();
			if (!schemaInfo) {
				const { generateSchema } = await import('./vite-gql-tada-plugin.js');
				const safeSchema = await generateSchema({
					appConfig,
				});
				schemaInfo = generateSchemaInfo(safeSchema);
			}
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				return `
                    export const schemaInfo = ${JSON.stringify(schemaInfo)};
                `;
			}
		},
	};
}

function generateSchemaInfo(schema: GraphQLSchema): SchemaInfo {
	// returns all named types
	const types = schema.getTypeMap();
	const result: SchemaInfo = {
		types: {},
		inputs: {},
		scalars: [],
		enums: {},
	};

	Object.values(types).forEach((type) => {
		if (isObjectType(type)) {
			const fields = type.getFields();
			result.types[type.name] = {};
			Object.entries(fields).forEach(([fieldName, field]) => {
				result.types[type.name][fieldName] = getTypeInfo(field.type);
			});
		}

		if (isInputObjectType(type)) {
			const fields = type.getFields();
			result.inputs[type.name] = {};
			Object.entries(fields).forEach(([fieldName, field]) => {
				result.inputs[type.name][fieldName] = getTypeInfo(field.type);
			});
		}

		if (isScalarType(type)) {
			result.scalars.push(type.name);
		}

		if (isEnumType(type)) {
			result.enums[type.name] = type.getValues().map((v) => v.value);
		}
	});

	return result;
}

function getTypeInfo(type: GraphQLType) {
	let nullable = true;
	let list = false;
	let isPaginatedList = false;

	// Unwrap NonNull
	if (type instanceof GraphQLNonNull) {
		nullable = false;
		type = type.ofType;
	}

	// Unwrap List
	if (type instanceof GraphQLList) {
		list = true;
		type = type.ofType;
	}

	if (type instanceof GraphQLObjectType) {
		if (type.getInterfaces().some((i) => i.name === 'PaginatedList')) {
			isPaginatedList = true;
		}
	}

	return [
		type.toString().replace(/!$/, ''),
		nullable,
		list,
		isPaginatedList,
	] as const;
}
