import type { ResultOf, TypedDocumentNode, VariablesOf } from '@graphql-typed-document-node/core';
import {
	type UseSuspenseQueryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { UseFormReturn } from 'react-hook-form';
import { api } from '@/infra/graphql/api.js';
import { getMutationNameFromDocumentNode, getQueryNameFromDocumentNode } from '@/lib/document-node-utils.js';
import { NEW_ENTITY_ROUTE_PATH } from '@/lib/keys.js';
import type { RemoveNullFields } from '@/lib/util-types.js';
import { useGenerateForm } from './use-generate-form.js';

const NEW_ENTITY_ID_PARAM = '__new__';

type DetailPageEntity<
	Query extends TypedDocumentNode<any, any>,
	EntityField extends keyof ResultOf<Query>,
> = ResultOf<Query>[EntityField];

interface UseDetailPageResult<
	Query extends TypedDocumentNode<any, any>,
	Update extends TypedDocumentNode<any, any>,
	EntityField extends keyof ResultOf<Query> = keyof ResultOf<Query>,
> {
	entity: DetailPageEntity<Query, EntityField> | undefined;
	form: UseFormReturn<RemoveNullFields<VariablesOf<Update>['input']>>;
	submitHandler: (event: React.SubmitEvent<HTMLFormElement>) => void;
	isPending: boolean;
	refreshEntity: () => void;
	resetForm: () => void;
}

interface UseDetailPageProps<
	Query extends TypedDocumentNode<any, any>,
	Create extends TypedDocumentNode<any, any>,
	Update extends TypedDocumentNode<any, any>,
	EntityField extends keyof ResultOf<Query> = keyof ResultOf<Query>,
	VariableNameCreate extends keyof VariablesOf<Create> = 'input',
	VariableNameUpdate extends keyof VariablesOf<Update> = 'input',
> {
	queryDocument: Query;
	createDocument?: Create;
	updateDocument?: Update;
	pageParams: {
		id: string;
	};
	queryDocumentEntityFieldName?: EntityField;
	onSuccess?: (
		data: ResultOf<Create>[keyof ResultOf<Create>] | ResultOf<Update>[keyof ResultOf<Update>],
	) => void;
	onError?: (error: unknown) => void;
	transformCreateInput?: (
		input: VariablesOf<Create>[VariableNameCreate],
	) => VariablesOf<Create>[VariableNameCreate];
	transformUpdateInput?: (
		input: VariablesOf<Update>[VariableNameUpdate],
	) => VariablesOf<Update>[VariableNameUpdate];
	setValuesForUpdate: (
		entity: NonNullable<ResultOf<Query>[EntityField]>,
	) => VariablesOf<Update>[VariableNameUpdate];
}

export function useDetailPage<
	Query extends TypedDocumentNode<any, any>,
	Create extends TypedDocumentNode<any, any>,
	Update extends TypedDocumentNode<any, any>,
	EntityField extends keyof ResultOf<Query> = keyof ResultOf<Query>,
>(props: UseDetailPageProps<Query, Create, Update>): UseDetailPageResult<Query, Update, EntityField> {
	// Detail Page:
	// - handles reading the entity by its param
	// - creates entity creation form as well as entity update form

	const {
		queryDocument,
		createDocument,
		updateDocument,
		pageParams,
		queryDocumentEntityFieldName,
		onSuccess,
		onError,
		transformCreateInput,
		transformUpdateInput,
		setValuesForUpdate,
	} = props;
	const qClient = useQueryClient();
	const router = useRouter();

	const isCreatingNewEntity = pageParams.id === NEW_ENTITY_ROUTE_PATH;

	// Step1: query entity

	const queryName = getQueryNameFromDocumentNode(queryDocument);
	const getQueryOptions = (): UseSuspenseQueryOptions => {
		// get query name from queryDocument -> queryDocument => asset
		const variables = {
			id: isCreatingNewEntity ? NEW_ENTITY_ID_PARAM : pageParams.id,
		};
		return {
			queryKey: [
				'entity-detail-page',
				queryName,
				variables,
			],
			queryFn: async () =>
				pageParams.id === NEW_ENTITY_ID_PARAM ? null : api.query(queryDocument, variables),
		};
	};
	const queryOptions = getQueryOptions();

	const query = useSuspenseQuery(queryOptions);
	const entityFieldName = queryDocumentEntityFieldName ?? queryName;
	const entity = (query.data as any)[entityFieldName] as DetailPageEntity<Query, EntityField> | undefined;

	// Step2: create form depending on the active operation
	const createMutation = useMutation({
		mutationFn: createDocument ? api.mutate(createDocument) : undefined,
		onSuccess: (data) => {
			if (createDocument) {
				const createMutationName = getMutationNameFromDocumentNode(createDocument);
				onSuccess?.((data as any)[createMutationName]);
			}
		},
		onError,
	});

	const updateMutation = useMutation({
		mutationFn: updateDocument ? api.mutate(updateDocument) : undefined,
		onSuccess: async (data) => {
			if (updateDocument) {
				const updateMutationName = getMutationNameFromDocumentNode(updateDocument);
				onSuccess?.((data as any)[updateMutationName]);
				await qClient.invalidateQueries({
					queryKey: queryOptions.queryKey,
				});
				void router.invalidate();
			}
		},
		onError,
	});

	const document = isCreatingNewEntity ? (createDocument ?? updateDocument) : updateDocument;

	const { form, submitHandler } = useGenerateForm({
		gqlDocument: document,
		entity,
		variableName: 'input',
		setValues: setValuesForUpdate,
		onSubmit(values) {
			if (isCreatingNewEntity) {
				createMutation.mutate({
					input: transformCreateInput ? transformCreateInput(values) : values,
				});
			} else {
				updateMutation.mutate({
					input: transformUpdateInput ? transformUpdateInput(values) : values,
				});
			}
		},
	});

	return {
		entity,
		form: form as any,
		submitHandler,
		isPending: updateMutation.isPending || query?.isPending,
		refreshEntity: query.refetch,
		resetForm: () => {
			form.reset(form.getValues());
		},
	};
}
