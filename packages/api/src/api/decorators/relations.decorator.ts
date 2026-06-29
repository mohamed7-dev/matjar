import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GraphQLResolveInfo, getNamedType, isObjectType } from 'graphql';
import { getMetadataArgsStorage } from 'typeorm';
import { InternalServerError } from '../../common/errors/errors';
import { AppEntity } from '../../common/helpers/app-entity';
import { ClassType } from '../../common/types/class-type';
import { EntityRelationPaths } from '../../common/types/entity-relation-paths';
import { filterUnique } from '../../common/utils/filter-unique';
import { InMemoryCacheStrategy } from '../../config/strategies/cache/in-memory-cache.strategy';
import { isGraphQLResolveInfo } from '../utils/is-gql-resolver-info';
import { parseContext } from '../utils/parse-context';

const graphqlFields = require('graphql-fields');

const DEFAULT_DEPTH = 3;

const cacheTTL = 5 * 60 * 1000;

const cache = new InMemoryCacheStrategy({
	cacheSize: 500,
});

export type RelationPaths<T extends AppEntity> = Array<EntityRelationPaths<T>>;

type RelationsDecoratorOptions<Entity extends AppEntity> =
	| ClassType<Entity>
	| {
			entity: ClassType<Entity>;
			depth?: number;
			omit?: RelationPaths<Entity>;
	  };

export const Relations: <Entity extends AppEntity>(
	options: RelationsDecoratorOptions<Entity>,
) => ParameterDecorator = createParamDecorator<RelationsDecoratorOptions<any>>(
	(data, ctx: ExecutionContext) => {
		if (!data) {
			throw new InternalServerError('@Relations decorator must be passed an entity type argument');
		}
		const { info } = parseContext(ctx);
		if (!isGraphQLResolveInfo(info)) return [];
		const cacheKey = `${info.fieldName}__${ctx.getArgByIndex(2).req.body.query as string}`;
		const cachedResult = cache.retrieve(cacheKey);
		if (cachedResult) return cachedResult;
		const fields = graphqlFields(info);
		const targetFields = isPaginatedListQuery(info) ? (fields.items ?? {}) : fields;
		const entity = typeof data === 'function' ? data : data.entity;
		const maxDepth = typeof data === 'function' ? DEFAULT_DEPTH : (data.depth ?? DEFAULT_DEPTH);
		const omit = typeof data === 'function' ? [] : (data.omit ?? []);
		const relationFields = getRelationPaths(targetFields, entity, maxDepth);
		let result = filterUnique(relationFields);
		for (const omitPath of omit) {
			result = result.filter((resultPath) => !resultPath.startsWith(omitPath as string));
		}
		cache.store(cacheKey, result, {
			ttlInMs: cacheTTL,
		});
		return result;
	},
);

function getRelationPaths(
	fields: Record<string, Record<string, any>>,
	entityType: ClassType<AppEntity>,
	maxDepth: number,
	depth = 1,
): string[] {
	const entityRelations = getMetadataArgsStorage().filterRelations(entityType);
	const relationPaths: string[] = [];
	for (const [prop, value] of Object.entries(fields)) {
		const relationMetadata = entityRelations.find((r) => r.propertyName === prop);
		if (relationMetadata) {
			relationPaths.push(prop);
			const relatedEntity =
				typeof relationMetadata.type === 'function'
					? // https://github.com/microsoft/TypeScript/issues/37663
						(relationMetadata.type as any)()
					: relationMetadata.type;

			if (depth < maxDepth) {
				depth++;
				const subPaths = getRelationPaths(
					value,
					relatedEntity as ClassType<AppEntity>,
					maxDepth,
					depth,
				);
				depth--;
				for (const subPath of subPaths) {
					relationPaths.push(
						[
							prop,
							subPath,
						].join('.'),
					);
				}
				// TODO: handle calculated columns
			}
		}
	}

	return relationPaths;
}

function isPaginatedListQuery(info: GraphQLResolveInfo): boolean {
	const returnType = getNamedType(info.returnType);
	return isObjectType(returnType) && !!returnType.getInterfaces().find((i) => i.name === 'PaginatedList');
}
