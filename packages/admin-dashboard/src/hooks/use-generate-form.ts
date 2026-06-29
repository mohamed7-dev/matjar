import type { TypedDocumentNode, VariablesOf } from '@graphql-typed-document-node/core';
import { useForm } from 'react-hook-form';
import { extractVariablesInfoFromDocumentNode } from '@/lib/document-node-utils.js';
import {
	getFormDefaultValues,
	getFormZodSchema,
	NullifyEmptyStrings,
	processTranslations,
	removeFieldsWithEmptyIds,
	stripNullsFromNullableFields,
} from '@/lib/form-utils.js';
import { zodResolver } from '@/lib/zod.js';
import { useMarketplaceRegion } from '@/providers/marketplace-region-provider.js';

interface GenerateFormOptions<
	D extends TypedDocumentNode<any, any>,
	VariableName extends keyof VariablesOf<D> | undefined = 'input',
	Entity extends Record<string, any> = Record<string, any>,
> {
	gqlDocument?: D;
	variableName?: VariableName;
	entity: Entity | undefined | null;
	/**
	 * @description
	 * Maps entity fields to form fields.
	 *
	 * @example
	 * ```tsx
	 * setValues: (entity) => {
	 *    return {
	 * 		featuredAssetId: entity.featuredAsset.id
	 *    };
	 *  },
	 * ```
	 */
	setValues: (
		entity: NonNullable<Entity>,
	) => VariableName extends keyof VariablesOf<D> ? VariablesOf<D>[VariableName] : VariablesOf<D>;
	onSubmit?: (
		values: VariableName extends keyof VariablesOf<D> ? VariablesOf<D>[VariableName] : VariablesOf<D>,
	) => void;
}

/**
 * @description
 * This hooks automates the process of form creation, by giving it a DocumentNode
 * it returns a form along with a submit handler
 */
export function useGenerateForm<
	D extends TypedDocumentNode<any, any>,
	VariableName extends keyof VariablesOf<D> | undefined = 'input',
	Entity extends Record<string, any> = Record<string, any>,
>(options: GenerateFormOptions<D, VariableName, Entity>) {
	const { gqlDocument, variableName, entity, setValues, onSubmit } = options;
	const {
		state: { activeMarketplaceRegion },
	} = useMarketplaceRegion('useGenerateFormLearn');
	// RHF needs zod schema, values and default values optimized for both create and update forms

	// Step1: we should introspect the gql document given to us to extract the input fields

	// TypedDocumentNode provides better typing for operations and variables
	// DocumentNode represents the AST format of the SDL string
	// parsed by the gql-tada tagged template literal
	// a single document can contain multiple operations (query, mutations, subscription)
	const fields = gqlDocument ? extractVariablesInfoFromDocumentNode(gqlDocument, variableName) : [];

	// Step2: for any form in the app, we have to handle two cases
	// one for create-form and another for update-form
	// in case of create form, we have to provide dummy default values to RHF based on the fields types
	// and in case of update form, we have to provide actual entity fields coming from the server

	const primaryLanguageCode = activeMarketplaceRegion?.primaryLanguageCode;
	const defaultValues = getFormDefaultValues(fields, primaryLanguageCode);

	// Step3: create zod schema based on the fields resolved from the input
	const schema = getFormZodSchema(fields);

	// Step4: extend entity coming with update form to add translations for all languages available
	// the ones coming with the entity will be respected, and any other language would be initialized
	// with default empty values
	const availableLanguages = activeMarketplaceRegion?.availableLanguageCodes;
	const processedEntity = processTranslations(entity, availableLanguages ?? undefined, defaultValues);

	// Step5: extend default values used with create form to add all translations
	const processedDefaultValues =
		processTranslations(defaultValues, availableLanguages ?? undefined, defaultValues) ?? defaultValues;

	const values = processedEntity ? setValues(processedEntity) : processedDefaultValues;

	const form = useForm({
		mode: 'onChange',
		defaultValues: processedDefaultValues,
		resolver: async (values, context, options) => {
			const result = await zodResolver(schema)(values, context, options);

			if (Object.keys(result.errors).length > 0) {
				console.log('Zod form validation errors:', result.errors);
			}
			return result;
		},
		values,
	});

	let submitHandler = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
	};

	if (onSubmit) {
		submitHandler = async (event: React.SubmitEvent<HTMLFormElement>) => {
			console.log(event);
			event.preventDefault();

			const isValid = await form.trigger();
			if (!isValid) {
				console.log(`Form invalid!`);
				event.stopPropagation();
				return;
			}

			const onSubmitWrapper = (values: any) => {
				let processed = NullifyEmptyStrings(removeFieldsWithEmptyIds(values, fields), fields);
				if (!entity) {
					processed = stripNullsFromNullableFields(processed, fields);
				}
				onSubmit(processed);
			};

			// FIXME: handleSubmit doesn't have values to pass to onSubmitWrapper
			// although validation is successful and when using form.getValues() everything works as expected

			form.handleSubmit(onSubmitWrapper)(event);
		};
	}

	return {
		form,
		submitHandler,
	};
}
