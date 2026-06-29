import { schemaInfo } from 'virtual:gql-schema-info';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { VariablesOf } from 'gql.tada';
import { Kind, type DocumentNode, type FieldNode, type NamedTypeNode, type OperationDefinitionNode, type TypeNode } from 'graphql';


// DocumentNode Variables Utils

export interface FieldInfo {
	name: string;
	type: string;
	isNullable: boolean;
	isList: boolean;
	isScalar: boolean;
	isPaginatedList: boolean;
	typeFields?: FieldInfo[];
}

export function extractVariablesInfoFromDocumentNode<
	D extends TypedDocumentNode<any, any>,
	VariableName extends keyof VariablesOf<D> | undefined = 'input',
>(document: D, variableName?: VariableName): FieldInfo[] {
	// single document can have multiple operations
	const oDef = document.definitions.find((d) => d.kind === 'OperationDefinition');
	const fieldsInfo: FieldInfo[] = [];

	if (oDef?.variableDefinitions) {
		const variableDefinitions = variableName
			? oDef.variableDefinitions.filter((vDef) => vDef.variable.name.value === variableName)
			: oDef.variableDefinitions;
		for (const vDef of variableDefinitions) {
			const variableName = vDef.variable.name.value;

			const unWrappedVDef = unWrapVariableDefinitionType(vDef.type);
			const typeName = unWrappedVDef.name.value;
			const isScalar = isScalarType(typeName);
			const inputTypeInfo: FieldInfo = isScalar
				? {
						name: variableName,
						type: typeName,
						isNullable: false,
						isList: false,
						isPaginatedList: false,
						isScalar: true,
					}
				: {
						name: variableName,
						type: typeName,
						isNullable: true,
						isList: false,
						isPaginatedList: false,
						isScalar: false,
						typeFields: getInputTypeFields(typeName),
					};
			fieldsInfo.push(inputTypeInfo);
		}
	}
	return fieldsInfo;
}

function unWrapVariableDefinitionType(type: TypeNode): NamedTypeNode {
	if (type.kind === Kind.NON_NULL_TYPE) {
		return unWrapVariableDefinitionType(type.type);
	}

	if (type.kind === Kind.LIST_TYPE) {
		return unWrapVariableDefinitionType(type.type);
	}

	return type;
}

function getInputTypeFields(typeName: string): FieldInfo[] {
	const inputInfo = schemaInfo.inputs[typeName];
	if (!inputInfo) {
		throw new Error(`Input type ${typeName} not found`);
	}

	const fieldsInfo: FieldInfo[] = [];
	for (const inputInfoEntries of Object.entries(inputInfo)) {
		const [fieldName, fieldInfo]: [
			string,
			any,
		] = inputInfoEntries;
		fieldsInfo.push({
			name: fieldName,
			type: fieldInfo[0],
			isNullable: fieldInfo[1],
			isList: fieldInfo[2],
			isPaginatedList: fieldInfo[3],
			isScalar: isScalarType(fieldInfo[0]),
			typeFields:
				!isScalarType(fieldInfo[0]) && !isEnumType(fieldInfo[0])
					? getInputTypeFields(fieldInfo[0])
					: undefined,
		});
	}

	return fieldsInfo;
}

// Operation Utils

export function getQueryNameFromDocumentNode<Q extends TypedDocumentNode<any,any>>(queryDocument:Q) {
		const queryDef = queryDocument.definitions.find(
		(def): def is OperationDefinitionNode =>
			def.kind === 'OperationDefinition' && def.operation === 'query',
	);

	if(!queryDef){
		throw new Error("OperationDefinition of type Query can't be found")
	}
	const firstSelection = queryDef.selectionSet.selections[0];
		if(firstSelection.kind !== "Field"){
			throw new Error('Could not determine query field');

		}

		return firstSelection.name.value
}

export function getMutationNameFromDocumentNode<M extends TypedDocumentNode<any,any>>(mutationDoc:M) {
const mutationDef = mutationDoc.definitions.find(
		(def): def is OperationDefinitionNode =>
			def.kind === 'OperationDefinition' && def.operation === 'mutation',
	);

	if(!mutationDef){
		throw new Error("OperationDefinition of type Mutation can't be found")
	}
	const firstSelection = mutationDef.selectionSet.selections[0];
		if(firstSelection.kind !== "Field"){
			throw new Error('Could not determine mutation field');

		}

		return firstSelection.name.value
}




// Validators

function isScalarType(type: string) {
	return schemaInfo.scalars.includes(type);
}

function isEnumType(type: string) {
	return schemaInfo.enums[type];
}

