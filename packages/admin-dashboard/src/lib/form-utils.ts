import { FieldInfo } from "./document-node-utils.js";
import { z,ZodRawShape, ZodType, ZodTypeAny } from "./zod.js";
import React from 'react';

/**
 * @description
 * Removes empty string values from GraphQL ID fields.
 *
 * GraphQL IDs cannot be submitted as `""`; they must either contain
 * a valid identifier or be omitted entirely.
 */
export function removeFieldsWithEmptyIds<T extends Record<string, any>>(values: T, fields: FieldInfo[]): T {
    if (!values) {
        return values;
    }

    const clone = structuredClone(values);

    const visit = (value: unknown, schema: FieldInfo[]): void => {
        if (value == null || typeof value !== 'object') {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(item => visit(item, schema));
            return;
        }

        for (const field of schema) {
            const current = (value as Record<string, any>)[field.name];

            if (field.type === 'ID' && current === '') {
                delete (value as Record<string, any>)[field.name];
                continue;
            }

            if (field.typeFields && current != null) {
                visit(current, field.typeFields);
            }
        }
    };

    visit(clone, fields);

    return clone;
}

/**
 * @description
 * Replaces empty strings with `null` for nullable GraphQL fields whose type
 * is not `String`.
 *
 * This prevents invalid values such as `""` from being submitted for
 * scalars like `Boolean`, `Int`, `Float`, `DateTime`, `Enum`, etc.
 */
export function NullifyEmptyStrings<T extends Record<string, any>>(values: T, fields: FieldInfo[]): T {
	 if (!values) {
        return values;
    }

    const clone = structuredClone(values);

    const visit = (value: unknown, schema: FieldInfo[]): void => {
        if (value == null || typeof value !== 'object') {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(item => visit(item, schema));
            return;
        }

        for (const field of schema) {
            const current = (value as Record<string, any>)[field.name];

            if (field.isNullable && field.type !== 'String' && current === '') {
                (value as Record<string, any>)[field.name] = null;
            }

            if (field.typeFields && current != null) {
                visit(current, field.typeFields);
            }
        }
    };

    visit(clone, fields);

    return clone;
}

/**
 * @description
 * Removes nullable fields whose value is explicitly `null`.
 *
 * Omitting nullable fields allows the GraphQL server to apply its default
 * behavior instead of explicitly receiving a `null` value.
 */
export function stripNullsFromNullableFields<T extends Record<string, any>>(values: T, fields: FieldInfo[]): T {
	if (!values) {
        return values;
    }

    const clone = structuredClone(values);

    const visit = (value: unknown, schema: FieldInfo[]): void => {
        if (value == null || typeof value !== 'object') {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(item => visit(item, schema));
            return;
        }

        for (const field of schema) {
            const current = (value as Record<string, any>)[field.name];

            if (field.isNullable && current === null) {
                delete (value as Record<string, any>)[field.name];
                continue;
            }

            if (field.typeFields && current != null) {
                visit(current, field.typeFields);
            }
        }
    };

    visit(clone, fields);

    return clone;
}


export function processTranslations<Entity extends Record<string, any>>(
	entity: Entity | null | undefined,
	allLanguages: string[] = [],
	expectedStructure?: Record<string, any>,
): Entity | null | undefined {
	if (
		!entity ||
		!('translations' in entity) ||
		!Array.isArray((entity as any).translations) ||
		!allLanguages.length
	) {
		return entity;
	}

	const clonedEntity = {
		...entity,
	} as any;

	const translations = [
		...(clonedEntity.translations ?? []),
	];

	const translationTemplate = translations[0] ?? {};
	const expectedStructureTemplate = expectedStructure?.translations?.[0] || {};

	const template = {
		...translationTemplate,
		...expectedStructureTemplate,
	};

	for (const languageCode of allLanguages) {
		const existing = translations.find((t) => t.languageCode === languageCode);
		if (existing) {
			Object.keys(template).forEach((key) => {
				if (key !== 'languageCode' && !(key in existing)) {
					const value = template[key];
					if (typeof value === 'object' && value !== null) {
						existing[key] = Array.isArray(value) ? [] : {};
					} else {
						existing[key] = '';
					}
				}
			});
		} else {
			const dummyTranslation: Record<string, any> = {};
			// if not existing, primitive translation fields should be "", and nested objects should be {}
			Object.keys(template).forEach((key) => {
				if (key !== 'languageCode') {
					const value = template[key];
					if (typeof value === 'object' && value !== null) {
						dummyTranslation[key] = Array.isArray(value) ? [] : {};
					} else {
						dummyTranslation[key] = '';
					}
				}
			});
			translations.push(dummyTranslation);
		}
	}

	clonedEntity.translations = translations;

	return clonedEntity as Entity;
}

export function getFormZodSchema(fields: FieldInfo[]) {
	const result: ZodRawShape = {};
	for (const field of fields) {
		if (!field.typeFields) {
			result[field.name] = getZodTypeFromField(field);
		} else {
			let nestedSchemaType: ZodType = getFormZodSchema(field.typeFields);

			if (field.isList) {
				nestedSchemaType = z.array(nestedSchemaType);
			}

			if (field.isNullable) {
				nestedSchemaType = nestedSchemaType.optional().nullable();
			}

			result[field.name] = nestedSchemaType;
		}
	}

	return z.object(result);
}

function getZodTypeFromField(field: FieldInfo): ZodTypeAny {
	let zodType: ZodType;

	switch (field.type) {
		case 'String':
		case 'ID':
		case 'DateTime':
			zodType = z.string();
			break;
		case 'Boolean':
			zodType = z.boolean();
			break;
		case 'Int':
		case 'Float':
			zodType = z.number();
			break;
		default:
			zodType = z.any();
	}

	if (field.isList) {
		zodType = z.array(zodType);
	}

	if (field.isNullable) {
		zodType = zodType.nullable().optional();
	}

	return zodType;
}

export function getFormDefaultValues(fields: FieldInfo[], primaryLanguageCode?: string) {
	const result: Record<string, any> = {};
	for (const field of fields) {
		if (!field.typeFields) {
			result[field.name] = getDefaultValuesFromField(field, primaryLanguageCode);
		} else {
			const nestedDefaultValues = getFormDefaultValues(field.typeFields, primaryLanguageCode);
			result[field.name] = field.isList
				? [
						nestedDefaultValues,
					]
				: nestedDefaultValues;
		}
	}

	return result;
}

function getDefaultValuesFromField(field: FieldInfo, primaryLanguageCode?: string) {
	if (field.isList) {
		return [];
	}

	if (field.isNullable) {
		switch (field.type) {
			case 'String':
			case 'ID':
				return '';
			case 'Boolean':
				return '';
			case 'LanguageCode':
				return primaryLanguageCode || 'en';
			default:
				if (field.type === 'JSON') {
					return {};
				}
				return null;
		}
	}

	switch (field.type) {
		case 'String':
		case 'DateTime':
		case 'ID':
			return '';
		case 'Int':
		case 'Float':
			return 0;
		case 'Boolean':
			return false;
		case 'LanguageCode':
			return primaryLanguageCode || 'en';
		case 'JSON':
			return {};
		default:
			return '';
	}
}


/**
 * Injects `id` and `aria-invalid` props onto the rendered element via cloneElement.
 * Used by FormFieldWrapper and TranslatableFormFieldWrapper to wire up
 * accessibility attributes without requiring the consumer to do it manually.
 */
export function applyFormControlProps(element: React.ReactNode, props: Record<string, unknown>) {
    if (!React.isValidElement(element)) return element;
    return React.cloneElement(element as React.ReactElement<Record<string, unknown>>, props);
}